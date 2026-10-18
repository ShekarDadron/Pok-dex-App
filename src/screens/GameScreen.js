import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchPokemonList } from '../api/pokeapi';

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const [allPokemon, setAllPokemon] = useState([]);
  const [currentTarget, setCurrentTarget] = useState(null);
  const [options, setOptions] = useState([]);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);

  useEffect(() => {
    loadGameData();
  }, []);

  const loadGameData = async () => {
    try {
      const data = await fetchPokemonList(151);
      setAllPokemon(data);
      setupNewRound(data);
    } catch (e) {
      console.error('Failed to load Pokémon game data:', e);
    } finally {
      setLoading(false);
    }
  };

  const setupNewRound = (dataList = allPokemon) => {
    if (!dataList || dataList.length === 0) return;

    setRevealed(false);

    const randomIndex = Math.floor(Math.random() * dataList.length);
    const target = dataList[randomIndex];
    setCurrentTarget(target);

    const shuffled = [...dataList]
      .filter((pokemon) => pokemon.id !== target.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const fourOptions = [...shuffled, target].sort(
      () => 0.5 - Math.random()
    );
    setOptions(fourOptions);
  };

  const handleGuess = (selectedItem) => {
    if (revealed || !currentTarget) return;

    setRevealed(true);

    if (selectedItem.id === currentTarget.id) {
      const newScore = score + 1;
      const newStreak = streak + 1;

      setScore(newScore);
      setStreak(newStreak);

      if (newStreak > best) {
        setBest(newStreak);
      }
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      setupNewRound();
    }, 1800);
  };

  return (
    <View style={styles.container}>
      {/* Header without the settings icon */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Who's That Pokémon?</Text>

        <View style={styles.scoreRow}>
          <Text style={styles.scoreText}>{`Score: ${score}`}</Text>
          <Text style={styles.scoreText}>{`Streak: ${streak}`}</Text>
          <Text style={styles.scoreText}>{`Best: ${best}`}</Text>
        </View>
      </View>

      {loading || !currentTarget ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#E60012" />
        </View>
      ) : (
        <View style={styles.gameBody}>
          {/* Silhouette Box */}
          <View style={styles.imageBox}>
            <Image
              source={{ uri: currentTarget.artwork }}
              style={[styles.pokemonImg, !revealed && styles.silhouette]}
              resizeMode="contain"
            />
          </View>

          {/* Option Buttons */}
          <View style={styles.optionsContainer}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionBtn,
                  revealed &&
                    option.id === currentTarget.id &&
                    styles.correctBtn,
                ]}
                activeOpacity={0.8}
                onPress={() => handleGuess(option)}
                disabled={revealed}
              >
                <Text style={styles.optionText}>
                  {option.name.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EBEBEB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: '#E60012',
    paddingBottom: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '85%',
    marginTop: 6,
  },
  scoreText: { color: '#FFD700', fontWeight: 'bold', fontSize: 12 },
  gameBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    padding: 20,
  },
  imageBox: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pokemonImg: { width: 200, height: 200 },
  silhouette: { tintColor: '#111111' },
  optionsContainer: { width: '100%', maxWidth: 340 },
  optionBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#111',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginVertical: 6,
  },
  correctBtn: { backgroundColor: '#4CAF50', borderColor: '#2E7D32' },
  optionText: { fontSize: 15, fontWeight: 'bold', color: '#111' },
});
