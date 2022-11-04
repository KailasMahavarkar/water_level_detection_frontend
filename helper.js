import { useEffect } from "react";

export function isNetworkError(err) {
    return !!err.isAxiosError && !err.response;
}

export function useEffectAsync(effect, inputs) {
    useEffect(() => {
        effect();
    }, inputs);
}