import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';




export const taskApi = createApi({
    reducerPath: 'taskApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `http://31.129.96.5:5000/api/`,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).userState.token;
            if (token) {
              headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getAllTasks: builder.query<any, { limit: string; page: string, type: string }>({
            query(arg) {
                const { limit, page, type } = arg;
                return {
                    url: 'get_all_task',
                    params: { limit, page, type },
                };
            },
        }),
        getOne: builder.query<any, { taskId: string }>({
            query(arg) {
                const { taskId } = arg;
                return {
                    url: 'get_one',
                    params: { taskId },
                };
            },
        }),
        createTask: builder.mutation({
            query(data) {
                const user = JSON.parse(localStorage.getItem('user'))
		        data.append("userId", user.user.id)
                return {
                    url: 'task',
                    method: 'POST',
                    body: data,
                    formData: true,
                }
            }
        }),
        addUser: builder.mutation({
            query(data) {
                const user = JSON.parse(localStorage.getItem('user'))
                data['userId'] = user.user.id;
                return {
                    url: 'add_user_in_task',
                    method: 'POST',
                    body: data,
                }
            }
        }),
        addRate: builder.mutation({
            query(data) {
                return {
                    url: 'create_rate',
                    method: 'POST',
                    body: data,
                }
            }
        }),
        deleteTask: builder.mutation({
            query(data) {
                return {
                    url: 'delTask',
                    method: 'POST',
                    body: data,
                }
            }
        }),
        deleteAllTask: builder.mutation({
            query() {
                return {
                    url: 'delallTask',
                    method: 'POST',
                }
            }
        }),
        getAllUserTasks: builder.query<any, { limit: string; page: string; type?: string; }>({
            query(arg) {
                const { limit, page, type } = arg;
                const user = JSON.parse(localStorage.getItem('user'))
                 
                return {
                    url: 'getUserTasks',
                    params: { limit, page, type, userId: user.user.id },
                };
            },
            keepUnusedDataFor: 1,
        }),
        getAllUserStat: builder.query<any, {type: string; }>({
            query(arg) {
                const { type } = arg;
                const user = JSON.parse(localStorage.getItem('user'))
                 
                return {
                    url: 'getUserStat',
                    params: { type, userId: user.user.id },
                };
            },
            keepUnusedDataFor: 1,
        }),
        getStatTasks: builder.query<any, any>({
            query(arg) {
                const { type, name } = arg;
                return {
                    url: 'getStat',
                    params: { type, name },
                };
            },
            keepUnusedDataFor: 1,
        }),
    })
})

export const {
    useCreateTaskMutation,
    useAddUserMutation,
    useDeleteTaskMutation,
    useDeleteAllTaskMutation,
    useAddRateMutation,
    useGetAllUserStatQuery,
    useGetAllUserTasksQuery,
    useGetStatTasksQuery,
    useGetAllTasksQuery,
    useGetOneQuery,
} = taskApi;