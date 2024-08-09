import { act, createElement, Fragment, useContext, useState } from 'react'
import * as tanstack from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import * as wagmi from 'wagmi'
import * as safeKit from '@safe-global/safe-kit'
import { SafeContext, SafeProvider } from '@/SafeProvider.js'
import { SafeConfig } from '@/types/index.js'
import { configExistingSafe, configPredictedSafe } from '@test/config.js'
import { signerPrivateKeys } from '@test/fixtures.js'

jest.mock('@tanstack/react-query')

type TestingComponentProps = { signerToSet?: string; configToSet?: SafeConfig }

const TestingComponent = ({ signerToSet = undefined, configToSet }: TestingComponentProps) => {
  const { initialized, config, setConfig, setSigner, publicClient, signerClient } =
    useContext(SafeContext)
  const [error, setError] = useState<Error>()

  const onClickSetConfig = () => {
    if (configToSet) {
      setConfig(configToSet)
    }
  }

  const onClickSetSigner = () => {
    setSigner(signerToSet).catch(setError)
  }

  return createElement(Fragment, null, [
    createElement(
      'p',
      { 'data-testid': 'initialized', key: 'initialized' },
      initialized.toString()
    ),
    createElement('p', { 'data-testid': 'config', key: 'config' }, JSON.stringify(config)),
    createElement(
      'p',
      { 'data-testid': 'publicClient', key: 'publicClient' },
      JSON.stringify(publicClient)
    ),
    createElement(
      'p',
      { 'data-testid': 'signerClient', key: 'signerClient' },
      JSON.stringify(signerClient)
    ),
    createElement(
      'button',
      { 'data-testid': 'setConfig', key: 'setConfig', onClick: onClickSetConfig },
      'setConfig'
    ),
    createElement(
      'button',
      { 'data-testid': 'setSigner', key: 'setSigner', onClick: onClickSetSigner },
      'setSigner'
    ),
    ...(error
      ? [createElement('div', { 'data-testid': 'error', key: 'error' }, error.toString())]
      : [])
  ])
}

const renderSafeProvider = (config: SafeConfig, testingCompProps: TestingComponentProps = {}) =>
  render(createElement(SafeProvider, { config }, createElement(TestingComponent, testingCompProps)))

describe('SafeProvider', () => {
  const publicClientMock = { safeClient: 'public' } as unknown as safeKit.SafeClient
  const signerClientMock = { safeClient: 'signer' } as unknown as safeKit.SafeClient

  const createConfigWagmiSpy = jest.spyOn(wagmi, 'createConfig')
  const createSafeClientSpy = jest.spyOn(safeKit, 'createSafeClient')
  const wagmiProviderSpy = jest.spyOn(wagmi, 'WagmiProvider')
  const queryClientProviderSpy = jest.spyOn(tanstack, 'QueryClientProvider')

  beforeEach(() => {
    queryClientProviderSpy.mockImplementation(({ children }) => children as JSX.Element)
    createSafeClientSpy.mockImplementation(({ signer }) =>
      Promise.resolve(signer ? signerClientMock : publicClientMock)
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render WagmiProvider, QueryClientProvider and children', async () => {
    renderSafeProvider(configExistingSafe)

    await waitFor(() => screen.getByTestId('initialized').textContent === 'true')
    expect(screen.getByTestId('initialized').textContent).toEqual('true')

    expect(createConfigWagmiSpy).toHaveBeenCalledTimes(1)
    expect(createConfigWagmiSpy).toHaveBeenCalledWith({
      chains: [configExistingSafe.chain],
      transports: { [configExistingSafe.chain.id]: configExistingSafe.transport }
    })

    expect(queryClientProviderSpy).toHaveBeenCalledTimes(2)
    expect(queryClientProviderSpy).toHaveBeenCalledWith(
      {
        client: expect.any(tanstack.QueryClient),
        children: createElement(TestingComponent)
      },
      {}
    )

    expect(wagmiProviderSpy).toHaveBeenCalledTimes(2)
    expect(wagmiProviderSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        config: createConfigWagmiSpy.mock.results[0].value
      }),
      {}
    )
  })

  it('should store passed config object in context', async () => {
    renderSafeProvider(configExistingSafe)

    await waitFor(() => screen.getByTestId('initialized').textContent === 'true')
    expect(screen.getByTestId('config').textContent).toEqual(JSON.stringify(configExistingSafe))
  })

  it('should create a public SafeClient instance', async () => {
    renderSafeProvider(configExistingSafe)

    await waitFor(() => screen.getByTestId('initialized').textContent === 'true')
    expect(screen.getByTestId('publicClient').textContent).toEqual(JSON.stringify(publicClientMock))
    expect(screen.getByTestId('signerClient').textContent).toEqual('')

    expect(createSafeClientSpy).toHaveBeenCalledTimes(1)
    expect(createSafeClientSpy).toHaveBeenCalledWith({
      signer: undefined,
      provider: configExistingSafe.provider,
      safeAddress: configExistingSafe.safeAddress
    })
  })

  it('should also create a signer SafeClient instance if `signer` prop present in config', async () => {
    renderSafeProvider({ ...configExistingSafe, signer: signerPrivateKeys[0] })

    await waitFor(() => screen.getByTestId('initialized').textContent === 'true')
    expect(screen.getByTestId('publicClient').textContent).toEqual(JSON.stringify(publicClientMock))
    expect(screen.getByTestId('signerClient').textContent).toEqual(JSON.stringify(signerClientMock))

    expect(createSafeClientSpy).toHaveBeenCalledTimes(2)
    expect(createSafeClientSpy).toHaveBeenCalledWith({
      signer: undefined,
      provider: configExistingSafe.provider,
      safeAddress: configExistingSafe.safeAddress
    })
    expect(createSafeClientSpy).toHaveBeenCalledWith({
      signer: signerPrivateKeys[0],
      provider: configExistingSafe.provider,
      safeAddress: configExistingSafe.safeAddress
    })
  })

  it('should throw if `provider` prop in config is empty', () => {
    const logErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderSafeProvider({ ...configExistingSafe, provider: '' })).toThrow(
      'Provider not set in config.'
    )
    logErrorSpy.mockRestore()
  })

  describe('setConfig', () => {
    it('should update the config in the context and re-initialize clients', async () => {
      const configToSet = { ...configPredictedSafe, signer: signerPrivateKeys[0] }

      renderSafeProvider(configExistingSafe, { configToSet })

      await waitFor(() => screen.getByTestId('initialized').textContent === 'true')

      expect(createSafeClientSpy).toHaveBeenCalledTimes(1)

      act(() => screen.getByTestId('setConfig').click())

      await waitFor(() => screen.getByTestId('config').textContent === JSON.stringify(configToSet))
      expect(screen.getByTestId('config').textContent).toEqual(JSON.stringify(configToSet))

      expect(screen.getByTestId('publicClient').textContent).toEqual(
        JSON.stringify(publicClientMock)
      )
      expect(screen.getByTestId('signerClient').textContent).toEqual(
        JSON.stringify(signerClientMock)
      )

      expect(createSafeClientSpy).toHaveBeenCalledTimes(3)
      expect(createSafeClientSpy).toHaveBeenCalledWith({
        signer: undefined,
        provider: configToSet.provider,
        safeOptions: configToSet.safeOptions
      })
      expect(createSafeClientSpy).toHaveBeenCalledWith({
        signer: configToSet.signer,
        provider: configToSet.provider,
        safeOptions: configToSet.safeOptions
      })
    })
  })

  describe('setSigner', () => {
    it('should create a signer client instance and store in the context', async () => {
      renderSafeProvider(configExistingSafe, { signerToSet: signerPrivateKeys[0] })

      await waitFor(
        () =>
          screen.getByTestId('signerClient').textContent === '' &&
          screen.getByTestId('initialized').textContent === 'true'
      )

      expect(createSafeClientSpy).toHaveBeenCalledTimes(1)

      act(() => screen.getByTestId('setSigner').click())

      await waitFor(
        () => screen.getByTestId('signerClient').textContent === JSON.stringify(signerClientMock)
      )
      expect(screen.getByTestId('signerClient').textContent).toEqual(
        JSON.stringify(signerClientMock)
      )

      expect(createSafeClientSpy).toHaveBeenCalledTimes(2)
      expect(createSafeClientSpy).toHaveBeenCalledWith({
        signer: signerPrivateKeys[0],
        provider: configExistingSafe.provider,
        safeAddress: configExistingSafe.safeAddress
      })
    })

    it('if called with `undefined`, should clear client instance in the context', async () => {
      renderSafeProvider(
        { ...configExistingSafe, signer: signerPrivateKeys[0] },
        { signerToSet: undefined }
      )

      await waitFor(() => screen.getByTestId('initialized').textContent === 'true')
      expect(screen.getByTestId('signerClient').textContent).toEqual(
        JSON.stringify(signerClientMock)
      )

      expect(createSafeClientSpy).toHaveBeenCalledTimes(2)

      act(() => screen.getByTestId('setSigner').click())

      await waitFor(() => screen.getByTestId('signerClient').textContent === '')
      expect(screen.getByTestId('signerClient').textContent).toEqual('')

      expect(createSafeClientSpy).toHaveBeenCalledTimes(2)
    })

    it('should throw if `createSafeClient` throws', async () => {
      renderSafeProvider(configExistingSafe, { signerToSet: signerPrivateKeys[0] })

      await waitFor(() => screen.getByTestId('initialized').textContent === 'true')
      expect(screen.getByTestId('signerClient').textContent).toEqual('')

      expect(createSafeClientSpy).toHaveBeenCalledTimes(1)

      createSafeClientSpy.mockRejectedValueOnce(new Error('Signer client error'))

      act(() => screen.getByTestId('setSigner').click())

      await waitFor(
        () =>
          screen.getByTestId('error').textContent ===
          'InitializeSafeProviderError: Failed to initialize signer client.'
      )
      expect(screen.getByTestId('error').textContent).toEqual(
        'InitializeSafeProviderError: Failed to initialize signer client.'
      )

      expect(createSafeClientSpy).toHaveBeenCalledTimes(2)
    })
  })
})
