import React from 'react';
import { TouchableOpacity, Text, Image, StyleSheet, View } from 'react-native';
import { RETRO_COLORS } from '../constants/theme';

export default function PokemonCard({ pokemon, onPress }) {
  const formattedId = `#${String(pokemon.id).padStart(3, '0')}`;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <Text style={styles.idText}>{formattedId}</Text>
      </View>
      <Image source={{ uri: pokemon.artwork }} style={styles.image} resizeMode="contain" />
      <Text style={styles.nameText} numberOfLines={1}>
        {pokemon.name.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 0.48,
    backgroundColor: RETRO_COLORS.cardBg,
    margin: '1%',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: RETRO_COLORS.borderDark,
    elevation: 2,
  },
  header: {
    width: '100%',
    alignItems: 'flex-end',
  },
  idText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: RETRO_COLORS.textSecondary,
  },
  image: {
    width: 75,
    height: 75,
    marginVertical: 4,
  },
  nameText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: RETRO_COLORS.textPrimary,
  },
});