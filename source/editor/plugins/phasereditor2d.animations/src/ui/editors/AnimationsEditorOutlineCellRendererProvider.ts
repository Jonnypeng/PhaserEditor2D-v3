namespace phasereditor2d.animations.ui.editors {

    import controls = colibri.ui.controls;

    export class AnimationsEditorOutlineCellRendererProvider implements controls.viewers.ICellRendererProvider {

        private _editor: AnimationsEditor;

        constructor(editor: AnimationsEditor) {

            this._editor = editor;
        }

        getCellRenderer(element: any): controls.viewers.ICellRenderer {

            if (element instanceof Phaser.Animations.Animation) {

                return new EditorAnimationCellRenderer(this._editor);

            } else if (element instanceof Phaser.Animations.AnimationFrame) {

                const cache = this._editor.getScene().getPackCache();

                const image = cache.getImage(element.textureKey, element.textureFrame);

                return new controls.viewers.ImageCellRenderer(image);
            }

            return new controls.viewers.EmptyCellRenderer();
        }

        async preload(args: controls.viewers.PreloadCellArgs): Promise<controls.PreloadResult> {

            return controls.PreloadResult.NOTHING_LOADED;
        }
    }
}