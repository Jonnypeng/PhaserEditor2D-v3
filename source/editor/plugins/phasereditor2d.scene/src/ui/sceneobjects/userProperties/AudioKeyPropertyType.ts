namespace phasereditor2d.scene.ui.sceneobjects {

    import controls = colibri.ui.controls;

    export class AudioKeyPropertyType extends AssetKeyPropertyType {

        constructor() {
            super("audio-key");
        }

        getName() {

            return "Audio Key";
        }

        getDialogTitle() {

            return "Select Audio Key";
        }

        getDialogSize() {

            const size = super.getDialogSize();

            size.height = window.innerHeight / 2;

            return size;
        }

        createViewer(finder: pack.core.PackFinder) {

            const viewer = super.createViewer(finder);

            viewer.setContentProvider(new AudioKeyContentProvider());

            return viewer;
        }
    }

    class AudioKeyContentProvider implements controls.viewers.ITreeContentProvider {

        getRoots(input: any): any[] {

            const packs = input as pack.core.AssetPack[];

            return packs

                .flatMap(pack => pack.getItems())

                .filter(item => item instanceof pack.core.AudioAssetPackItem)
        }

        getChildren(parent: any): any[] {

            return [];
        }
    }
}