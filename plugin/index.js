'use strict';

const PERMISSION_SERVICES = ['_bonjour._tcp', '_lnp._tcp'];
const DEFAULT_USAGE_DESCRIPTION =
  'Allow this app to discover devices on your local network.';

function readProps(props = {}) {
  if (!props || typeof props !== 'object' || Array.isArray(props)) {
    throw new TypeError('Bonjour Zeroconf plugin options must be an object.');
  }

  const { bonjourServices = [], localNetworkUsageDescription } = props;
  if (
    !Array.isArray(bonjourServices) ||
    bonjourServices.some(
      (service) => typeof service !== 'string' || service.trim() === ''
    )
  ) {
    throw new TypeError(
      'bonjourServices must be an array of non-empty strings.'
    );
  }
  if (
    localNetworkUsageDescription !== undefined &&
    (typeof localNetworkUsageDescription !== 'string' ||
      localNetworkUsageDescription.trim() === '')
  ) {
    throw new TypeError(
      'localNetworkUsageDescription must be a non-empty string.'
    );
  }

  return {
    bonjourServices: bonjourServices.map((service) => service.trim()),
    localNetworkUsageDescription: localNetworkUsageDescription?.trim(),
  };
}

function configureInfoPlist(infoPlist, props) {
  const options = readProps(props);
  const existingServices = infoPlist.NSBonjourServices ?? [];
  const existingDescription = infoPlist.NSLocalNetworkUsageDescription;

  if (
    !Array.isArray(existingServices) ||
    existingServices.some((service) => typeof service !== 'string')
  ) {
    throw new TypeError('NSBonjourServices must be an array of strings.');
  }
  if (
    existingDescription !== undefined &&
    typeof existingDescription !== 'string'
  ) {
    throw new TypeError('NSLocalNetworkUsageDescription must be a string.');
  }

  infoPlist.NSLocalNetworkUsageDescription =
    options.localNetworkUsageDescription ||
    existingDescription ||
    DEFAULT_USAGE_DESCRIPTION;
  infoPlist.NSBonjourServices = [
    ...new Set([
      ...existingServices,
      ...PERMISSION_SERVICES,
      ...options.bonjourServices,
    ]),
  ];

  return infoPlist;
}

function withBonjourZeroconf(config, props) {
  const { withInfoPlist } = require('expo/config-plugins');

  return withInfoPlist(config, (mod) => {
    configureInfoPlist(mod.modResults, props);
    return mod;
  });
}

module.exports = withBonjourZeroconf;
module.exports.configureInfoPlist = configureInfoPlist;
