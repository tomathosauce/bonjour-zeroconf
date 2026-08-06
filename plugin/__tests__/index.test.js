'use strict';

const { configureInfoPlist } = require('..');

test('merges Bonjour services without duplicates', () => {
  const infoPlist = {
    NSBonjourServices: ['_existing._tcp'],
    NSLocalNetworkUsageDescription: 'Keep this message',
  };
  const options = { bonjourServices: [' _http._tcp ', '_existing._tcp'] };

  configureInfoPlist(infoPlist, options);
  configureInfoPlist(infoPlist, options);

  expect(infoPlist).toEqual({
    NSBonjourServices: [
      '_existing._tcp',
      '_bonjour._tcp',
      '_lnp._tcp',
      '_http._tcp',
    ],
    NSLocalNetworkUsageDescription: 'Keep this message',
  });
  expect(() => configureInfoPlist({}, { bonjourServices: [''] })).toThrow(
    'bonjourServices must be an array of non-empty strings.'
  );
});
