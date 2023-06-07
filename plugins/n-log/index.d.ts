export interface nLogOptions {
    /**
     * 打印的前缀提示，这样方便快速找到log --------------------
     * @example
     * console.log('line of 1 --------------------', ...)
     */
    preTip?: string;
    afterTip?: string;
    /** 每个参数分隔符，默认空字符串，你也可以使用换行符\n，分号；逗号，甚至猪猪🐖都行~ */
    splitBy?: string | boolean;
    /**
     * 是否需要endLine
     * @example
     * console.log('line of 1 --------------------', ..., 'line of 10 --------------------')
     *  */
    endLine?: boolean;
}
declare const _default: (api: object, options: nLogOptions, dirname: string) => import("@babel/core").PluginObj<import("@babel/core").PluginPass>;
export default _default;
