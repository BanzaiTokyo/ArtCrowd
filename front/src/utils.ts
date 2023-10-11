export function cutTheMiddle(str: string) {
    if (str != null) {
        return str.substr(0, 5) + '...' + str.substr(str.length - 5, str.length);
    }
    return str;
}

export function cutTheTail(str: string, len: number) {
    if (str != null) {
        return str.substr(0, len) + (str.length > len ? '...' : '');
    }
    return str;
}

export function formatTez(amount: number): string {
    const inTez = Math.abs(amount / 1000000);
    if (amount === 0) {
        return String(0);
    }

    const fractionDigits = inTez < 5 ? 2 : 0;
    return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
    }).format(inTez);
}

export function getCookie(cookieName: string, cookies = document.cookie) {
  for (const cookie of cookies.split('; ')) {
    const [name, value] = cookie.split('=');
    const trimmedName = name.trim();
    if (trimmedName === cookieName) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

export function deleteCookie(cookieName: string) {
  document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export const configureFetch = (token: string | null) => {
  return (url: string, options?: RequestInit) => {
    let headers = new Headers(options?.headers);
    if (headers.get('Content-Type') === 'multipart/form-data') {
        headers.delete('Content-Type')
    } else {
        headers.set('Content-Type', 'application/json');
    }
    if (token) {
      headers.set('Authorization', `token ${token}`)
    }
    const fetchOptions: RequestInit = {
      ...options,
      headers,
    };

    return fetch(url, fetchOptions);
  };
};
