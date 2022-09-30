import { createContext } from "react";
import UserService from "../services/UserService";

const defaultUser = {
  id: '',
}

type UserContextProviderProps = {
  children: React.ReactNode
}

export const UserContext = createContext(defaultUser);

export const getOrRegisterUser = async () => {
  const localStorageUserId = await UserService.getUserIdFromLocalStorage();
  if (localStorageUserId) {
    defaultUser.id = localStorageUserId;
    return;
  }
  
  await registerUser();
}

export const registerUser = async () => {
  const userId = await UserService.registerUser();
  if (!userId) throw new Error("User id not generated");

  defaultUser.id = userId;
  await UserService.setLocalStorageUserId(userId);
}

export const UserContextProvider = ({children}: UserContextProviderProps) => {
  return (
    <UserContext.Provider value={defaultUser}>
      {children}
    </UserContext.Provider>
  )
}
