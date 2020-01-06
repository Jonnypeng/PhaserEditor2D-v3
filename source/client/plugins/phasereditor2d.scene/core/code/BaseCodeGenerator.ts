namespace phasereditor2d.scene.core.code {

    export abstract class BaseCodeGenerator {

        private _text: string;
        private _replace: string;
        private _indent: number;

        constructor() {
            this._text = "";
            this._indent = 0;
        }

        getOffset() {
            return this._text.length;
        }

        generate(replace: string): string {

            this._replace = replace ?? "";

            this.internalGenerate();

            return this._text;
        }

        protected abstract internalGenerate(): void;

        length() {
            return this._text.length;
        }

        getStartSectionContent(endTag: string, defaultContent: string) {

            const j = this._replace.indexOf(endTag);

            const size = this._replace.length;

            if (size > 0 && j !== -1) {

                const section = this._replace.substring(0, j);

                return section;
            }

            return defaultContent;
        }

        getSectionContent(openTag: string, closeTag: string, defaultContent: string) {

            const i = this._replace.indexOf(openTag);
            let j = this._replace.indexOf(closeTag);

            if (j === -1) {

                j = this._replace.length;
            }

            if (i !== -1 && j !== -1) {

                const section = this._replace.substring(i + openTag.length, j);

                return section;
            }

            return defaultContent;
        }

        getReplaceContent() {
            return this._replace;
        }

        userCode(text: string): void {

            const lines = text.split("\n");

            for (const line of lines) {

                this.line(line);
            }
        }

        public sectionStart(endTag: string, defaultContent: string) {

            this.append(this.getStartSectionContent(endTag, defaultContent));

            this.append(endTag);
        }

        public sectionEnd(openTag: string, defaultContent: string) {

            this.append(openTag);
            this.append(this.getSectionContent(openTag, "papa(--o^^o--)pig", defaultContent));
        }

        public section(openTag: string, closeTag: string, defaultContent: string) {

            const content = this.getSectionContent(openTag, closeTag, defaultContent);

            this.append(openTag);
            this.append(content);
            this.append(closeTag);
        }

        public cut(start: number, end: number) {

            const str = this._text.substring(start, end);

            const s1 = this._text.slice(0, start);
            const s2 = this._text.slice(end, this._text.length);

            this._text = s1 + s2;
            // _sb.delete(start, end);

            return str;
        }

        public trim(run: () => void) {

            const a = this.length();

            run();

            const b = this.length();

            const str = this._text.substring(a, b);

            if (str.trim().length === 0) {
                this.cut(a, b);
            }
        }

        append(str: string) {

            this._text += str;
        }

        join(list: string[]) {

            for (let i = 0; i < list.length; i++) {

                if (i > 0) {
                    this.append(", ");
                }

                this.append(list[i]);
            }
        }

        line(line = "") {

            this.append(line);
            this.append("\n");
            this.append(this.getIndentTabs());
        }

        static escapeStringLiterals(str: string) {
            return str.replace("\\", "\\\\").replace("\\R", "\n").replace("'", "\\'").replace("\"", "\\\"");
        }

        openIndent(line = "") {

            this._indent++;
            this.line(line);
        }

        closeIndent(str = "") {

            this._indent--;
            this.line();
            this.line(str);
        }

        getIndentTabs() {

            return "\t".repeat(this._indent);
        }

        static emptyStringToNull(str: string) {

            return str == null ? null : (str.trim().length === 0 ? null : str);
        }
    }
}