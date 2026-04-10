export class FileUtils {
    public static loadPageScript(src: string): Promise<string> {
        return new Promise<string>((
            resolve: (value: string | PromiseLike<string>) => void,
            reject: (reason?: any) => void): void => {
            const script: HTMLScriptElement = document.createElement("script");
            script.src = src;
            script.onload = (): void => resolve('Script loaded: ' + src);
            script.onerror = (): void => reject(new Error("Script load error for: " + src));
            document.body.appendChild(script);
        });
    }

    static loadPageStyle(src: string, insertBeforeElement: HTMLStyleElement): void {
        const link: HTMLLinkElement = document.createElement("link");
        link.rel = "stylesheet";
        link.type = "text/css";
        link.href = src;
        document.head.insertBefore(link, insertBeforeElement);
    }
}