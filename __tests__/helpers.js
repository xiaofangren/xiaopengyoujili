// ============================================
// 测试工具 — 将源码加载为全局变量
// ============================================
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

/**
 * 读取 JS 源码文件，将其放在 IIFE 中执行并返回指定名称的导出，
 * 最后赋值到 globalThis 上供测试使用。
 *
 * 原理：用 IIFE 包裹源码，使 const/let 声明保留在函数作用域内，
 * 通过 return 将需要的引用传递出来，再赋给 globalThis。
 */
export function loadSource(relativePath, exportNames) {
    const filePath = path.resolve(ROOT, relativePath);
    const code = fs.readFileSync(filePath, 'utf-8');

    // 将源码包裹在 IIFE 中，返回命名导出
    const wrapper = `(function(){\n${code}\nreturn { ${exportNames.join(', ')} };\n})()`;

    let exports;
    try {
        exports = (0, eval)(wrapper);
    } catch (e) {
        console.error(`❌ 加载源码失败: ${relativePath}`);
        console.error(`   ${e.message}`);
        // 回退：用 eval 直接执行（仅用于查看错误）
        try { (0, eval)(code); } catch (e2) {
            console.error(`   直译错误: ${e2.message}`);
        }
        throw e;
    }

    for (const name of exportNames) {
        if (name in exports) {
            globalThis[name] = exports[name];
        } else {
            console.warn(`⚠️ 导出中没有: ${name}`);
        }
    }
}

/**
 * 读取整个 JS 文件作为 IIFE 执行（不捕获返回值）
 * 适用于有副作用的脚本（如 sound.js 定义 SOUND 但也会主动调用）
 */
export function runScript(relativePath) {
    const filePath = path.resolve(ROOT, relativePath);
    const code = fs.readFileSync(filePath, 'utf-8');
    const wrapper = `(function(){\n${code}\n})()`;
    try {
        (0, eval)(wrapper);
    } catch (e) {
        console.error(`❌ 运行脚本失败: ${relativePath} - ${e.message}`);
        throw e;
    }
}

/**
 * 复制纯函数的源码并返回可调用的函数引用
 */
export function extractFunction(relativePath, fnName) {
    const filePath = path.resolve(ROOT, relativePath);
    const code = fs.readFileSync(filePath, 'utf-8');
    const body = extractTopLevelCode(code, fnName, 'function');
    if (!body) throw new Error(`未找到函数: ${fnName} in ${relativePath}`);
    const fnCode = `function ${fnName}${body}`;
    return (0, eval)(`(${fnCode})`);
}

/**
 * 从源码中提取顶层代码块（函数 / 对象 / 常量等）
 */
function extractTopLevelCode(code, name, type) {
    if (type === 'function') {
        const regex = new RegExp(
            `(?:async\\s+)?function\\s+${name}\\s*\\(([^)]*)\\)\\s*\\{`,
            'm'
        );
        const match = regex.exec(code);
        if (!match) return null;

        const startIdx = match.index + match[0].length - 1; // 指向 {
        let braceCount = 1;
        let endIdx = startIdx + 1;
        while (braceCount > 0 && endIdx < code.length) {
            if (code[endIdx] === '{') braceCount++;
            else if (code[endIdx] === '}') braceCount--;
            endIdx++;
        }
        return code.slice(match.index + match[0].length - 1, endIdx);
    }
    return null;
}