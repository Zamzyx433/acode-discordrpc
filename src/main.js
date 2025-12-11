import plugin from '../plugin.json';
import { DiscordRichPresence } from './Plugin.js';

if (window.acode) {
  const mPlugin = new DiscordRichPresence(plugin);
  acode.setPluginInit(plugin.id, mPlugin.init.bind(mPlugin), mPlugin.pSettings);
  acode.setPluginUnmount(plugin.id, mPlugin.destroy.bind(mPlugin));
}
