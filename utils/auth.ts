// utils/auth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  name: string;
  email: string;
  password: string;
};

const USERS_KEY = 'users';
const SESSION_KEY = 'active_user';

export async function registerUser(newUser: User): Promise<string | null> {
  try {
    const existingUsers = await AsyncStorage.getItem(USERS_KEY);
    let users: User[] = existingUsers ? JSON.parse(existingUsers) : [];

    const userExists = users.some(u => u.email === newUser.email);
    if (userExists) {
      return 'Este usuario ya está registrado';
    }

    users.push(newUser);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    return null;
  } catch (error) {
    return 'Error al registrar el usuario';
  }
}

export async function loginUser(email: string, password: string): Promise<User | null> {
  try {
    const existingUsers = await AsyncStorage.getItem(USERS_KEY);
    if (!existingUsers) return null;

    const users: User[] = JSON.parse(existingUsers);
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return user;
    }

    return null;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await AsyncStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
}

export async function logoutUser() {
  await AsyncStorage.removeItem(SESSION_KEY);
}
