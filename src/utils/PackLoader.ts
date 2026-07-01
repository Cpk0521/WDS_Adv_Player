import { Sound, sound } from '@pixi/sound';
import { AssetExtension, extensions, ExtensionType, checkExtension, LoaderParser, LoaderParserPriority, ResolvedAsset, DOMAdapter } from 'pixi.js';

interface IWDSVoiceMetadata {
    mimeType? : string,
}

type IWDSVoiceAsset = {
    meta : any,
    voice : Record<string, Sound>,
}

const loaderName : string = 'wds-voice-loader';

const WDSVoiceParser : AssetExtension<IWDSVoiceAsset, IWDSVoiceMetadata> = {
    extension: ExtensionType.Asset,
    loader: {
        name: loaderName,
        extension: {
            type: ExtensionType.LoadParser,
            priority: LoaderParserPriority.Normal,
            name: loaderName,
        },

        test(url: string): boolean
        {
            return checkExtension(url, ".wds") || checkExtension(url, ".cpk");
        },

        async load(url: string): Promise<ArrayBuffer>
        {
            const response = await DOMAdapter.get().fetch(url);
            if (!response.ok)
				throw new Error(`[${loaderName}] Failed to fetch ${url}: ${response.status} ${response.statusText}`);

            const arrayBuffer = await response.arrayBuffer();

            return arrayBuffer
        },

        testParse (asset: unknown, options: ResolvedAsset): Promise<boolean>{
            const isWDS = checkExtension(options.src as string, '.wds')
            const isCPK = checkExtension(options.src as string, '.cpk')

            return Promise.resolve(isWDS || isCPK)
        },

        async parse(asset: unknown, options: ResolvedAsset<IWDSVoiceMetadata>): Promise<IWDSVoiceAsset>
        {
            const metadata: IWDSVoiceMetadata = options.data || {};

            const view = new DataView(asset as ArrayBuffer);
            const jsonLength = view.getUint32(0, true);
            
            const jsonUint8Array = new Uint8Array(asset as ArrayBuffer, 4, jsonLength);
            const decoder = new TextDecoder('utf-8');
            const indexTable = JSON.parse(decoder.decode(jsonUint8Array));

            const audioBlockStartOffset = 4 + jsonLength;

            const totalBlob = new Blob([asset as ArrayBuffer]);

            const mimeType = metadata.mimeType || 'audio/mpeg';
            const voiceMap : Record<string, Sound> = {};

            for (const cueName in indexTable) {
                const { offset, length } = indexTable[cueName];
                const absoluteOffset = audioBlockStartOffset + offset;
                const audioSegmentBlob = totalBlob.slice(absoluteOffset, absoluteOffset + length, mimeType);
                const blobUrl = URL.createObjectURL(audioSegmentBlob);

                const soundObj = Sound.from({
                    ...options.data,
                    url : blobUrl,
                    preload: true,
                })

                voiceMap[cueName] = sound.add(cueName, soundObj);
            }

            return {
                meta: indexTable,
                voice: voiceMap
            };
        },

        /** Remove the sound from the library */
        async unload(vAsset: IWDSVoiceAsset, asset: ResolvedAsset): Promise<void>
        {
            vAsset.meta && Object.keys(vAsset.meta).forEach((cueName) => {
                if (sound.exists(cueName)) {
                    sound.remove(cueName);
                }
            });
        }

    } as LoaderParser<IWDSVoiceAsset, IWDSVoiceMetadata>,
} as AssetExtension<IWDSVoiceAsset, IWDSVoiceMetadata>;

extensions.add(WDSVoiceParser);
