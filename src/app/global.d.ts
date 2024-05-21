import App from './app'

declare global {
  interface Window {
    app: InstanceType<typeof App>
  }
}

export {}
