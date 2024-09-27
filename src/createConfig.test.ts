import * as viem from 'viem'
import { createConfig } from '@/createConfig.js'
import { configParamsExistingSafe, configParamsPredictedSafe } from '@test/config.js'
import { eip1193Provider } from '@test/fixtures/index.js'

describe('createConfig', () => {
  const httpTransportSpy = jest.spyOn(viem, 'http').mockReturnValue('httpTransport' as any)
  const customTransportSpy = jest.spyOn(viem, 'custom').mockReturnValue('customTransport' as any)

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe.each([
    ['an existing', configParamsExistingSafe],
    ['a predicted', configParamsPredictedSafe]
  ])('with parameters for %s Safe', (_, configParams) => {
    it('should return a config with an HttpTransport instance if `provider` param is a string', () => {
      const config = createConfig(configParams)

      expect(config).toMatchObject({ ...configParams, transport: 'httpTransport' })

      expect(httpTransportSpy).toHaveBeenCalledTimes(1)
      expect(httpTransportSpy).toHaveBeenCalledWith(configParams.provider)
      expect(customTransportSpy).toHaveBeenCalledTimes(0)
    })

    it('should return a config with a CustomTransport instance if `provider` param is an Eip1193Provider', () => {
      const configParams1193 = {
        ...configParams,
        provider: eip1193Provider
      }

      const config = createConfig(configParams1193)

      expect(config).toMatchObject({
        ...configParams1193,
        transport: 'customTransport'
      })

      expect(httpTransportSpy).toHaveBeenCalledTimes(0)
      expect(customTransportSpy).toHaveBeenCalledWith(configParams1193.provider)
      expect(customTransportSpy).toHaveBeenCalledTimes(1)
    })
  })
})
