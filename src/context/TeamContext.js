import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const TeamContext = createContext();

const STORAGE_KEY = '@pokedex_shekar_team_02240172';

export const TeamProvider = ({ children }) => {
  const [team, setTeam] = useState([]);

  useEffect(() => {
    loadSavedTeam();
  }, []);

  const loadSavedTeam = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTeam(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading stored team from AsyncStorage:', error);
    }
  };

  const saveTeam = async (updatedTeam) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTeam));
    } catch (error) {
      console.error('Error saving team to AsyncStorage:', error);
    }
  };

  const addToTeam = (pokemon) => {
    if (team.length >= 6) return false;
    if (team.some((item) => item.id === pokemon.id)) return false;

    const updated = [...team, pokemon];
    setTeam(updated);
    saveTeam(updated);
    return true;
  };

  const removeFromTeam = (pokemonId) => {
    const updated = team.filter((item) => item.id !== pokemonId);
    setTeam(updated);
    saveTeam(updated);
  };

  const isInTeam = (pokemonId) => team.some((item) => item.id === pokemonId);

  return (
    <TeamContext.Provider
      value={{
        team,
        addToTeam,
        removeFromTeam,
        isInTeam,
        isFull: team.length >= 6,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};