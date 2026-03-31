import { SetMetadata } from "@nestjs/common";

export const REFRESH_USER_CACHE_KEY = 'updateUserCache';
export const RefreshUserCache = () => SetMetadata(REFRESH_USER_CACHE_KEY, true);