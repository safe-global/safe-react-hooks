import { renderHook, waitFor } from '@testing-library/react'
import * as safeKit from '@safe-global/safe-kit'
import { useSafeClient } from '@/hooks/useSafeClient.js'
import * as useConfig from '@/hooks/useConfig.js'
import { configExistingSafe, configPredictedSafe } from '@test/config.js'

describe('useSafeClient', () => {
  const safeClientMock = { foo: 'bar' } as unknown as safeKit.SafeClient

  const createSafeClientSpy = jest.spyOn(safeKit, 'createSafeClient')
  const useConfigSpy = jest.spyOn(useConfig, 'useConfig')

  beforeEach(() => {
    useConfigSpy.mockReturnValue(configExistingSafe)
    createSafeClientSpy.mockResolvedValue(safeClientMock)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return a SafeClient instance and a function to get it', async () => {
    const { result } = renderHook(() => useSafeClient())

    expect(useConfigSpy).toHaveBeenCalledTimes(1)
    expect(useConfigSpy).toHaveBeenCalledWith()

    expect(result.current).toBeUndefined()

    await waitFor(() => expect(result.current).toMatchObject(safeClientMock))

    expect(useConfigSpy).toHaveBeenCalledTimes(2)
    expect(useConfigSpy).toHaveBeenCalledWith()

    expect(createSafeClientSpy).toHaveBeenCalledTimes(1)
    expect(createSafeClientSpy).toHaveBeenCalledWith(configExistingSafe)
  })

  it('should accept a config to override the one from the SafeProvider', async () => {
    const { result } = renderHook(() => useSafeClient({ config: configPredictedSafe }))

    expect(useConfigSpy).toHaveBeenCalledTimes(1)
    expect(useConfigSpy).toHaveBeenCalledWith({ config: configPredictedSafe })

    expect(result.current).toBeUndefined()

    await waitFor(() => expect(result.current).toMatchObject(safeClientMock))

    expect(useConfigSpy).toHaveBeenCalledTimes(2)
    expect(useConfigSpy).toHaveBeenCalledWith({ config: configPredictedSafe })
  })
})
