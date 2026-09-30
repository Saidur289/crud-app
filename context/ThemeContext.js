import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PALETTE } from '../constants/theme';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState(systemColorScheme || 'light');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@user_theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setTheme(savedTheme);
        }
      } catch (e) {
        console.error('Error loading theme preference:', e);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem('@user_theme', newTheme).catch((e) =>
        console.error('Error saving theme preference:', e)
      );
      return newTheme;
    });
  };

  const isDarkMode = theme === 'dark';
  const colors = useMemo(() => (isDarkMode ? PALETTE.dark : PALETTE.light), [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
