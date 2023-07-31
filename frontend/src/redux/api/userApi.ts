import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';




export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `http://31.129.96.5:5000/api/user/`,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).userState.token;
            if (token) {
              headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getAllUsers: builder.query<any, { limit: string; page: string }>({
            query(arg) {
                const { limit, page } = arg;
                return {
                    url: 'getUsers',
                    params: { limit, page },
                };
            },
        }),
        updateUser: builder.mutation({
            query(data) {
                return {
                    url: 'change_inf_user',
                    method: 'POST',
                    body: data,
                }
            }
        }),
        deleteUser: builder.mutation({
            query(data) {
                return {
                    url: 'del_user',
                    method: 'POST',
                    body: data,
                }
            }
        }),

    })
})

export const {
    useGetAllUsersQuery,
    useUpdateUserMutation,
    useDeleteUserMutation,
} = userApi;