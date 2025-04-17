import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface AuthState {
  token: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  token: null,
  isAuthenticated: false,
}

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload
      state.isAuthenticated = !!action.payload
    },
    clearToken: (state) => {
      state.token = null
      state.isAuthenticated = false
    },
  },
})

export const { setToken, clearToken } = authSlice.actions
export default authSlice.reducer
