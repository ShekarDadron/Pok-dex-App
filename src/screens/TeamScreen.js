import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TeamContext } from '../context/TeamContext';

export default function TeamScreen() {
  const insets = useSafeAreaInsets();
  const { team, removeFromTeam } = useContext(TeamContext);

  const combinedStats = team.reduce((acc, pokemon) => {
    if (!pokemon.stats) return acc;
    return acc + pokemon.stats.reduce((statsTotal, stat) => statsTotal + stat.value, 0);
  }, 0);

  const renderMember = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.artwork }}
        style={styles.cardImage}
        resizeMode="contain"
      />

      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.name.toUpperCase()}</Text>
        <Text style={styles.cardId}>
          {`#${String(item.id).padStart(3, '0')}`}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => removeFromTeam(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${item.name} from team`}
      >
        <Text style={styles.removeBtnText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header without the settings icon */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>My Pokémon Team</Text>
        <Text style={styles.headerSub}>{`${team.length}/6 Members`}</Text>
        <Text style={styles.headerStat}>
          {`Combined Base Stats: ${combinedStats}`}
        </Text>
      </View>

      {team.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Your team is empty!</Text>
          <Text style={styles.emptySub}>
            Select up to 6 Pokémon from the Pokédex screen.
          </Text>
        </View>
      ) : (
        <FlatList
          data={team}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMember}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EBEBEB' },
  header: {
    backgroundColor: '#E60012',
    paddingBottom: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  headerSub: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 3,
  },
  headerStat: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  listContent: { padding: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#222',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
  },
  cardImage: { width: 60, height: 60, marginRight: 12 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '900', color: '#111' },
  cardId: { fontSize: 12, fontWeight: 'bold', color: '#666', marginTop: 2 },
  removeBtn: {
    backgroundColor: '#E60012',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  removeBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
});
