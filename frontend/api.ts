export const apiCall = (url: `/${string}`, options: RequestInit) => {
    const token = localStorage.getItem("token");
    //console.log("Using token:", token);
    //console.log("Calling: ", `${process.env.NEXT_PUBLIC_API_URL}${url}`);
    return fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
      ...options,
      headers: {
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }).then(async (res) => {
      let data = null;
      if (res.status !== 204) {
        try {
          data = await res.json();
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      }
      return [data, res.status] as const;
    });
  };
  