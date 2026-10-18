import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image as ExpoImage } from 'expo-image';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import {
  fetchPokemonList,
  fetchPokemonByType,
  fetchAllPokemonNames,
} from '../api/pokeapi';

const TYPES = [
  'All', 'Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice',
  'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug',
  'Rock', 'Ghost', 'Dragon', 'Steel', 'Dark', 'Fairy',
];

function PokemonImage({ artwork }) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !artwork) {
    return (
      <View style={styles.imageFallbackContainer}>
        <MaterialCommunityIcons
          name="pokeball"
          size={54}
          color="#D0D0D0"
        />
      </View>
    );
  }

  return (
    <ExpoImage
      source={{ uri: artwork }}
      style={styles.cardImage}
      contentFit="contain"
      transition={200}
      cachePolicy="disk"
      onError={() => setHasError(true)}
    />
  );
}

export default function PokedexScreen({ navigation }) {
  const [pokemonList, setPokemonList] = useState([]);
  const [allNamesIndex, setAllNamesIndex] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [sortBy, setSortBy] = useState('number');
  const [offset, setOffset] = useState(171);

  const LIMIT = 30;

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);

      try {
        const [initialList, allNames] = await Promise.all([
          fetchPokemonList(171, LIMIT),
          fetchAllPokemonNames(),
        ]);

        if (!active) return;

        setPokemonList(
          [...(initialList || [])].sort((a, b) => a.id - b.id)
        );

        setAllNamesIndex(allNames || []);
      } catch (error) {
        console.error('Unable to initialize Pokédex:', error);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const loadMorePokemon = async () => {
    if (
      loadingMore ||
      loading ||
      searchQuery.length > 0 ||
      selectedType !== 'All'
    ) {
      return;
    }

    setLoadingMore(true);

    try {
      const nextOffset = offset + LIMIT;
      const newData = await fetchPokemonList(nextOffset, LIMIT);

      if (newData?.length) {
        setPokemonList((prev) => {
          const itemMap = new Map();

          [...prev, ...newData].forEach((item) => {
            if (item?.id) {
              itemMap.set(item.id, item);
            }
          });

          return [...itemMap.values()].sort((a, b) => a.id - b.id);
        });

        setOffset(nextOffset);
      }
    } catch (error) {
      console.error('Unable to load more Pokémon:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleTypeSelect = async (type) => {
    setSelectedType(type);
    setSearchQuery('');
    setLoading(true);

    try {
      if (type === 'All') {
        setOffset(171);

        const data = await fetchPokemonList(171, LIMIT);

        setPokemonList(
          [...(data || [])].sort((a, b) => a.id - b.id)
        );
      } else {
        const data = await fetchPokemonByType(type);
        setPokemonList(data || []);
      }
    } catch (error) {
      console.error('Unable to filter Pokémon:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);

    if (!text.trim()) {
      handleTypeSelect(selectedType);
      return;
    }

    const query = text.trim().toLowerCase();

    setPokemonList(
      allNamesIndex.filter(
        (item) =>
          (item?.name &&
            item.name.toLowerCase().includes(query)) ||
          (item?.id && String(item.id) === query)
      )
    );
  };

  const getSortedList = useCallback(() => {
    const list = [...pokemonList];

    return list.sort((a, b) =>
      sortBy === 'name'
        ? (a?.name || '').localeCompare(b?.name || '')
        : (a?.id || 0) - (b?.id || 0)
    );
  }, [pokemonList, sortBy]);

  const renderPokemonCard = ({ item }) => {
    const safeId = item?.id
      ? String(item.id).padStart(3, '0')
      : '000';

    const safeName = item?.name
      ? item.name.charAt(0).toUpperCase() + item.name.slice(1)
      : 'Unknown';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => {
          if (!item?.id && !item?.name) {
            console.warn(
              'Cannot open Pokémon without an ID/name:',
              item
            );
            return;
          }

          navigation.navigate('Detail', {
            pokemonId: item.id ?? item.name,
            name: item.name,
          });
        }}
      >
        <Text style={styles.cardId}>#{safeId}</Text>

        <PokemonImage artwork={item?.artwork} />

        <Text style={styles.cardName} numberOfLines={1}>
          {safeName}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right']}
    >
      {/* Redesigned Pokédex Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <MaterialCommunityIcons
            name="pokeball"
            size={27}
            color="#FFFFFF"
            style={styles.headerIcon}
          />

          <Text style={styles.headerTitle}>
            Shekar's Pokédex
          </Text>
        </View>

        <Text style={styles.headerSubtitle}>
          Gotta Catch 'Em All!
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#888888"
          style={styles.searchIcon}
        />

        <TextInput
          style={styles.searchInput}
          placeholder="Search all Pokémon by name..."
          placeholderTextColor="#999999"
          value={searchQuery}
          onChangeText={handleSearch}
        />

        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons
              name="close-circle"
              size={18}
              color="#888888"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Pokémon Type Filters */}
      <View style={styles.typeScrollViewWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typeFilterContainer}
        >
          {TYPES.map((type) => {
            const isActive = selectedType === type;

            return (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeChip,
                  styles[`typeChip_${type}`] ||
                    styles.typeChipDefault,
                  isActive && styles.typeChipActive,
                ]}
                onPress={() => handleTypeSelect(type)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.typeChipText,
                    isActive && styles.typeChipTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Sorting Controls */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort By:</Text>

        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === 'number' && styles.sortButtonActive,
          ]}
          onPress={() => setSortBy('number')}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortBy === 'number' &&
                styles.sortButtonTextActive,
            ]}
          >
            Number (#)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === 'name' && styles.sortButtonActive,
          ]}
          onPress={() => setSortBy('name')}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortBy === 'name' &&
                styles.sortButtonTextActive,
            ]}
          >
            Name (A-Z)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Pokémon List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#E60012"
          />
        </View>
      ) : (
        <FlatList
          data={getSortedList()}
          keyExtractor={(item, index) =>
            item?.id ? String(item.id) : String(index)
          }
          renderItem={renderPokemonCard}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContainer}
          onEndReached={loadMorePokemon}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                size="small"
                color="#E60012"
                style={{ marginVertical: 16 }}
              />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },

  /* Redesigned Header */
  header: {
    backgroundColor: '#E60012',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 4,
    borderBottomColor: '#B8000E',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },

  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerIcon: {
    marginRight: 9,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '900',
    letterSpacing: 0.3,
    includeFontPadding: false,
  },

  headerSubtitle: {
    color: '#FFE5E5',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginTop: 6,
    includeFontPadding: false,
  },

  /* Search Bar */
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#333333',
  },

  searchIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    paddingVertical: 0,
    includeFontPadding: false,
  },

  /* Type Filters */
  typeScrollViewWrapper: {
    marginVertical: 4,
  },

  typeFilterContainer: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },

  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  typeChipDefault: { backgroundColor: '#444444' },
  typeChip_All: { backgroundColor: '#333333' },
  typeChip_Normal: { backgroundColor: '#A8A878' },
  typeChip_Fire: { backgroundColor: '#F08030' },
  typeChip_Water: { backgroundColor: '#6890F0' },
  typeChip_Grass: { backgroundColor: '#78C850' },
  typeChip_Electric: { backgroundColor: '#F8D030' },
  typeChip_Ice: { backgroundColor: '#98D8D8' },
  typeChip_Fighting: { backgroundColor: '#C03028' },
  typeChip_Poison: { backgroundColor: '#A040A0' },
  typeChip_Ground: { backgroundColor: '#E0C068' },
  typeChip_Flying: { backgroundColor: '#A890F0' },
  typeChip_Psychic: { backgroundColor: '#F85888' },
  typeChip_Bug: { backgroundColor: '#A8B820' },
  typeChip_Rock: { backgroundColor: '#B8A038' },
  typeChip_Ghost: { backgroundColor: '#705898' },
  typeChip_Dragon: { backgroundColor: '#7038F8' },
  typeChip_Steel: { backgroundColor: '#B8B8D0' },
  typeChip_Dark: { backgroundColor: '#705848' },
  typeChip_Fairy: { backgroundColor: '#EE99AC' },

  typeChipActive: {
    borderWidth: 2,
    borderColor: '#000000',
  },

  typeChipText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  typeChipTextActive: {
    color: '#FFFFFF',
  },

  /* Sorting */
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },

  sortLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333333',
    includeFontPadding: false,
  },

  sortButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#CCCCCC',
  },

  sortButtonActive: {
    backgroundColor: '#2B73B9',
  },

  sortButtonText: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '600',
    includeFontPadding: false,
  },

  sortButtonTextActive: {
    color: '#FFFFFF',
  },

  /* Loading */
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Pokémon Cards */
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },

  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  cardId: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: 'bold',
    color: '#888888',
    includeFontPadding: false,
  },

  cardImage: {
    width: 100,
    height: 100,
    marginVertical: 6,
  },

  imageFallbackContainer: {
    width: 100,
    height: 100,
    marginVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222222',
    includeFontPadding: false,
  },
});