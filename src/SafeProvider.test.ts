import { createElement } from 'react'
import * as tanstack from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import * as wagmi from 'wagmi'
import { SafeProvider } from '@/SafeProvider.js'
import { configExistingSafe } from '@test/config.js'

jest.mock('@tanstack/react-query')

describe('SafeProvider', () => {
  const createConfigWagmiSpy = jest.spyOn(wagmi, 'createConfig')
  const wagmiProviderSpy = jest.spyOn(wagmi, 'WagmiProvider')
  const queryClientProviderSpy = jest.spyOn(tanstack, 'QueryClientProvider')

  beforeEach(() => {
    queryClientProviderSpy.mockImplementation(({ children }) => children as JSX.Element)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render WagmiProvider, QueryClientProvider and children', () => {
    const children = createElement('h1', null, 'Hello world')

    render(createElement(SafeProvider, { config: configExistingSafe }, children))

    expect(screen.getByRole('heading').textContent).toMatchInlineSnapshot(`"Hello world"`)

    expect(createConfigWagmiSpy).toHaveBeenCalledTimes(1)
    expect(createConfigWagmiSpy).toHaveBeenCalledWith({
      chains: [configExistingSafe.chain],
      transports: { [configExistingSafe.chain.id]: configExistingSafe.transport }
    })

    expect(queryClientProviderSpy).toHaveBeenCalledTimes(1)
    expect(queryClientProviderSpy).toHaveBeenCalledWith(
      {
        client: expect.any(tanstack.QueryClient),
        children
      },
      {}
    )

    expect(wagmiProviderSpy).toHaveBeenCalledTimes(1)
    expect(wagmiProviderSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        config: createConfigWagmiSpy.mock.results[0].value
      }),
      {}
    )
  })
})
