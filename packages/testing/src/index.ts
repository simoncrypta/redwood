// https://testing-library.com/docs/react-testing-library/setup#custom-render
import './global'

export * from '@testing-library/react'
export { customRender as render } from './customRender'

export { MockProviders } from './MockProviders'

export * from './mockRequests'
