import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IGenericResponse, IUserState } from './types';
import { setUser } from '../features/userSlice';
import { RootState } from '../store';
import { RegisterInput } from '../../pages/Register/Register';
import { LoginInput } from '../../pages/Login/Login';


//31.129.96.5
export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `http://31.129.96.5:5000/api/user/`,
        prepareHeaders: (headers, { getState, endpoint }) => {
            const token = (getState() as RootState).userState.token;
            if (token && endpoint == 'editUser') {
              headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        registerUser: builder.mutation<IGenericResponse, RegisterInput>({
            query(data) {
                return {
                    url: 'registration',
                    method: 'POST',
                    body: data,
                };
            },
        }),
        editUser: builder.mutation({
            query(data) {
                const user = JSON.parse(localStorage.getItem('user'))
		        data['id'] = user.user.id;
                return {
                    url: 'change_myself_inf_user',
                    method: 'POST',
                    body: data,
                };
            },
        }),
        loginUser: builder.mutation<IUserState, LoginInput>({
            query(data) {
                return {
                    url: 'login',
                    method: 'POST',
                    body: data,
                }
            },
            async onQueryStarted(args, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setUser(data));
                } catch (error) {
                    console.log(error)
                }
            },
        }),
        refreshUser: builder.mutation<IUserState, { token: string; }>({
            query(data) {
                return {
                    url: 'refreshJWTToken',
                    method: 'POST',
                    body: data,
                };
            },
            async onQueryStarted(args, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setUser(data));
                } catch (error) {
                    console.log(error)
                }
            },
        }),

    })
})

export const {
    useLoginUserMutation,
    useRegisterUserMutation,
    useEditUserMutation,
    useRefreshUserMutation,
} = authApi;