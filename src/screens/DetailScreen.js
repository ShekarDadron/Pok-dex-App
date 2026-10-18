import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity,
  StyleSheet, ImageBackground, Dimensions, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchPokemonDetail } from '../api/pokeapi';
import { TeamContext } from '../context/TeamContext';
import StatBar from '../components/StatBar';
import TypeBadge from '../components/TypeBadge';
import { RETRO_COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.78;
const CARD_HEIGHT = CARD_WIDTH * 1.72;

export default function DetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const targetParam =
    route?.params?.pokemonId ??
    route?.params?.id ??
    route?.params?.name;

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { addToTeam, removeFromTeam, isInTeam, isFull } = useContext(TeamContext);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.1)).current;
  const cardTranslateY = useRef(new Animated.Value(90)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const flashScale = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    let active = true;
    const loadDetails = async () => {
      if (targetParam == null || targetParam === '') {
        setDetails(null);
        setError(true);
        setLoading(false);
        console.error('No Pokémon ID/name was passed to DetailScreen:', route?.params);
        return;
      }

      setLoading(true);
      setError(false);
      setDetails(null);

      try {
        const data = await fetchPokemonDetail(targetParam);
        if (active) {
          setDetails(data);
          triggerSequence();
        }
      } catch (e) {
        console.error('Failed to load Pokémon details:', e);
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDetails();
    return () => {
      active = false;
      [shakeAnim, cardScale, cardTranslateY, fadeAnim, floatAnim, flashOpacity, flashScale]
        .forEach(anim => anim.stopAnimation());
    };
  }, [targetParam]);

  const startFloatAnimation = () => {
    floatAnim.setValue(0);
    Animated.loop(Animated.sequence([
      Animated.timing(floatAnim, { toValue: -8, duration: 2000, useNativeDriver: true }),
      Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
    ])).start();
  };

  const triggerSequence = () => {
    shakeAnim.setValue(0);
    cardScale.setValue(0.1);
    cardTranslateY.setValue(90);
    fadeAnim.setValue(0);
    floatAnim.setValue(0);
    flashOpacity.setValue(0);
    flashScale.setValue(0.3);

    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -1, duration: 110, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0.7, duration: 90, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -0.7, duration: 90, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 70, useNativeDriver: true }),
      Animated.delay(100),
      Animated.parallel([
        Animated.sequence([
          Animated.parallel([
            Animated.timing(flashOpacity, { toValue: 1, duration: 90, useNativeDriver: true }),
            Animated.timing(flashScale, { toValue: 2.8, duration: 220, useNativeDriver: true }),
          ]),
          Animated.timing(flashOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        ]),
        Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.spring(cardScale, { toValue: 1, friction: 7, tension: 40, useNativeDriver: true }),
        Animated.spring(cardTranslateY, { toValue: 0, friction: 7, tension: 40, useNativeDriver: true }),
      ]),
    ]).start(({ finished }) => {
      if (finished) startFloatAnimation();
    });
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={RETRO_COLORS.pokedexRed} /></View>;
  }

  if (error || !details) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Unable to load Pokémon details.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const inTeam = isInTeam(details.id);
  const rotateInterpolate = shakeAnim.interpolate({
    inputRange: [-1, 0, 1], outputRange: ['-10deg', '0deg', '10deg'],
  });

  return (
    <View style={styles.container}>
      <View style={[styles.topHeader, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.pokeballWrapper, { transform: [{ translateY: floatAnim }] }]}>
          <Animated.Image
            source={require('../../assets/pokeball_open.png')}
            style={[styles.pokeballBg, { transform: [{ rotate: rotateInterpolate }] }]}
            resizeMode="contain"
          />
          <Animated.View pointerEvents="none" style={[
            styles.flashOverlay,
            { opacity: flashOpacity, transform: [{ scale: flashScale }] },
          ]} />

          <Animated.View style={[
            styles.animatedCardContainer,
            { opacity: fadeAnim, transform: [{ scale: cardScale }, { translateY: cardTranslateY }] },
          ]}>
            <ImageBackground
              source={require('../../assets/kalos_card.png')}
              style={styles.cardFrame}
              imageStyle={styles.cardImageStyle}
              resizeMode="contain"
            >
              <View style={styles.cardGlassViewport}>
                <View style={styles.cardHeader}>
                  <Text style={styles.name} numberOfLines={1}>{details.name.toUpperCase()}</Text>
                  <Text style={styles.idText}>#{String(details.id).padStart(3, '0')}</Text>
                </View>

                <Image source={{ uri: details.artwork }} style={styles.image} resizeMode="contain" />

                <View style={styles.typeRow}>
                  {details.types.map(type => <TypeBadge key={type} type={type} />)}
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>HEIGHT</Text>
                    <Text style={styles.infoValue}>{details.height} m</Text>
                  </View>
                  <View style={styles.infoDivider} />
                  <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>WEIGHT</Text>
                    <Text style={styles.infoValue}>{details.weight} kg</Text>
                  </View>
                </View>

                <View style={styles.statsContainer}>
                  <Text style={styles.sectionHeader}>BASE STATS</Text>
                  <View style={styles.statsBox}>
                    {details.stats.map(stat => (
                      <StatBar key={stat.name} label={stat.name} value={stat.value} />
                    ))}
                  </View>
                </View>
              </View>
            </ImageBackground>
          </Animated.View>
        </Animated.View>

        <Animated.View style={{ width: '100%', alignItems: 'center', opacity: fadeAnim }}>
          <TouchableOpacity
            style={[
              styles.teamButton,
              inTeam ? styles.removeBtn : isFull ? styles.disabledBtn : styles.addBtn,
            ]}
            onPress={() => inTeam ? removeFromTeam(details.id) : addToTeam(details)}
            disabled={!inTeam && isFull}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>
              {inTeam ? 'Remove from Team' : isFull ? 'Team Full (6/6)' : 'Add to Team'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: RETRO_COLORS.screenBg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  topHeader: { backgroundColor: '#E60012', paddingHorizontal: 16, paddingBottom: 10, flexDirection: 'row', alignItems: 'center' },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  backBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginLeft: 4 },
  scroll: { paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center' },
  pokeballWrapper: { width: '100%', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: 540 },
  pokeballBg: { position: 'absolute', width: width * 0.95, height: 520 },
  flashOverlay: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: '#FFFFFF', zIndex: 5, elevation: 12, shadowColor: '#FFFFFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 25 },
  animatedCardContainer: { alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  cardFrame: { width: CARD_WIDTH, height: CARD_HEIGHT, paddingTop: CARD_HEIGHT * 0.17, paddingBottom: CARD_HEIGHT * 0.17, paddingHorizontal: CARD_WIDTH * 0.08, justifyContent: 'center' },
  cardImageStyle: { borderRadius: 14 },
  cardGlassViewport: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.88)', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)', overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', paddingBottom: 2, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  name: { fontSize: 13, fontWeight: '900', color: RETRO_COLORS.textPrimary, flex: 1 },
  idText: { fontSize: 11, fontWeight: 'bold', color: RETRO_COLORS.textSecondary, marginLeft: 4 },
  image: { width: 80, height: 80, marginVertical: 2 },
  typeRow: { flexDirection: 'row', marginVertical: 2 },
  infoRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-evenly', alignItems: 'center', marginVertical: 2, backgroundColor: 'rgba(240,240,240,0.85)', paddingVertical: 3, borderRadius: 6 },
  infoBox: { alignItems: 'center' },
  infoDivider: { width: 1, height: 16, backgroundColor: '#CCC' },
  infoTitle: { fontSize: 8, color: '#666', fontWeight: 'bold' },
  infoValue: { fontSize: 10, fontWeight: 'bold', color: RETRO_COLORS.textPrimary },
  statsContainer: { width: '100%' },
  sectionHeader: { fontSize: 9, fontWeight: '900', marginBottom: 2, color: RETRO_COLORS.textPrimary },
  statsBox: { width: '100%' },
  teamButton: { width: '85%', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8, borderWidth: 2, borderColor: RETRO_COLORS.borderDark },
  addBtn: { backgroundColor: RETRO_COLORS.pokedexRed },
  removeBtn: { backgroundColor: '#444' },
  disabledBtn: { backgroundColor: '#AAA' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  errorText: { color: RETRO_COLORS.textPrimary, fontSize: 16, marginBottom: 16, textAlign: 'center' },
  retryButton: { backgroundColor: RETRO_COLORS.pokedexRed, padding: 12, borderRadius: 8, alignItems: 'center' },
});
