namespace colibri.ui.controls.viewers {

    export class TreeViewerRenderer {

        private _viewer: TreeViewer;

        constructor(viewer: TreeViewer, cellSize: number = ROW_HEIGHT) {

            this._viewer = viewer;

            this._viewer.setCellSize(cellSize);

            this._viewer.restoreCellSize();
        }

        getViewer() {
            return this._viewer;
        }

        paint(): {
            contentHeight: number,
            paintItems: PaintItem[],
            treeIconList: TreeIconInfo[]
        } {
            const viewer = this._viewer;

            const x = 0;
            const y = viewer.getScrollY();

            const contentProvider = viewer.getContentProvider();

            const roots = contentProvider.getRoots(viewer.getInput());
            const treeIconList: TreeIconInfo[] = [];
            const paintItems: PaintItem[] = [];

            this.paintItems(roots, treeIconList, paintItems, null, x, y);

            let contentHeight = Number.MIN_VALUE;

            for (const paintItem of paintItems) {
                contentHeight = Math.max(paintItem.y + paintItem.h, contentHeight);
            }

            contentHeight -= viewer.getScrollY();

            return {
                contentHeight: contentHeight,
                treeIconList: treeIconList,
                paintItems: paintItems
            };

        }

        protected sortObjects(objects: any[]): any[] {

            if (!this._viewer.isSorted()) {

                return objects;
            }

            const labelMap = new Map<any, string>();

            for (const obj of objects) {

                const label = this._viewer.getLabelProvider().getLabel(obj);

                labelMap.set(obj, label);
            }

            const sorted = [...objects];

            sorted.sort((obj1, obj2) => {

                const label1 = labelMap.get(obj1);

                const label2 = labelMap.get(obj2);

                return label1.localeCompare(label2);
            });

            return sorted;
        }

        protected paintItems(
            objects: any[], treeIconList: TreeIconInfo[], paintItems: PaintItem[],
            parentPaintItem: PaintItem, x: number, y: number) {

            const viewer = this._viewer;

            objects = this.sortObjects(objects);

            const context = viewer.getContext();

            const b = viewer.getBounds();

            for (const obj of objects) {

                const children = viewer.getContentProvider().getChildren(obj);
                const expanded = viewer.isExpanded(obj);
                let newParentPaintItem: PaintItem = null;

                if (viewer.isFilterIncluded(obj)) {

                    const renderer = viewer.getCellRendererProvider().getCellRenderer(obj);

                    const args = new RenderCellArgs(
                        context, x + LABEL_MARGIN, y, b.width - x - LABEL_MARGIN, 0, obj, viewer);

                    const cellHeight = renderer.cellHeight(args);
                    args.h = cellHeight;

                    viewer.paintItemBackground(obj, 0, y, b.width, cellHeight);

                    if (y > -viewer.getCellSize() && y < b.height) {

                        // render tree icon
                        if (children.length > 0) {
                            const iconY = y + (cellHeight - TREE_ICON_SIZE) / 2;

                            const icon = ColibriPlugin.getInstance()
                                .getIcon(expanded ? ICON_CONTROL_TREE_COLLAPSE : ICON_CONTROL_TREE_EXPAND);

                            icon.paint(context, x, iconY, TREE_ICON_SIZE, TREE_ICON_SIZE, false);

                            treeIconList.push({
                                rect: new Rect(x, iconY, TREE_ICON_SIZE, TREE_ICON_SIZE),
                                obj: obj
                            });
                        }

                        this.renderTreeCell(args, renderer);
                    }

                    const item = new PaintItem(paintItems.length, obj, parentPaintItem);
                    item.set(args.x, args.y, args.w, args.h);
                    paintItems.push(item);

                    newParentPaintItem = item;

                    y += cellHeight;

                }

                if (expanded) {

                    const result = this.paintItems(
                        children, treeIconList, paintItems, newParentPaintItem, x + LABEL_MARGIN, y);

                    y = result.y;
                }
            }

            return { x: x, y: y };
        }

        private renderTreeCell(args: RenderCellArgs, renderer: ICellRenderer): void {

            let x = args.x;
            let y = args.y;

            const ctx = args.canvasContext;
            ctx.fillStyle = Controls.getTheme().viewerForeground;

            let args2: RenderCellArgs;

            if (args.h <= ROW_HEIGHT) {

                args2 = new RenderCellArgs(
                    args.canvasContext, args.x, args.y, TREE_ICON_SIZE, args.h, args.obj, args.viewer);

                x += 20;
                y += 15;

            } else {

                args2 = new RenderCellArgs(
                    args.canvasContext, args.x, args.y, args.w, args.h - 20, args.obj, args.viewer);
                y += args2.h + 15;
            }

            ctx.save();

            this.prepareContextForRenderCell(args2);

            renderer.renderCell(args2);

            ctx.restore();

            ctx.save();

            this.prepareContextForText(args);

            this.renderLabel(args, x, y);

            ctx.restore();
        }

        protected renderLabel(args: RenderCellArgs, x: number, y: number) {

            const styledProvider = this._viewer.getStyledLabelProvider();

            const selected = this._viewer.isSelected(args.obj);

            if (!selected && styledProvider) {

                this.renderStyledLabel(args, x, y, styledProvider);

            } else {

                this.renderPlainLabel(args, x, y);
            }
        }

        protected renderPlainLabel(args: RenderCellArgs, x: number, y: number) {

            const label = args.viewer.getLabelProvider().getLabel(args.obj);

            args.canvasContext.fillText(label, x, y);
        }

        protected renderStyledLabel(args: RenderCellArgs, x: number, y: number, styledProvider: IStyledLabelProvider) {

            const selected = this._viewer.isSelected(args.obj);

            const dark = controls.Controls.getTheme().dark;

            const parts = styledProvider.getStyledTexts(args.obj, dark);

            let cursor = x;

            const ctx = args.canvasContext;

            ctx.save();

            for (const part of parts) {

                ctx.fillStyle = part.color;

                ctx.fillText(part.text, cursor, y);

                const metrics = ctx.measureText(part.text);

                cursor += metrics.width;
            }

            ctx.restore();
        }

        protected prepareContextForRenderCell(args: RenderCellArgs) {
            // nothing by default
        }

        protected prepareContextForText(args: RenderCellArgs) {

            if (args.viewer.isSelected(args.obj)) {

                args.canvasContext.fillStyle = Controls.getTheme().viewerSelectionForeground;
            }
        }
    }
}