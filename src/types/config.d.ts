declare module 'config.json' {
  export const elmServiceUrl: string;
}

declare module '*.json' {
  const value: any;
  export default value;
}
