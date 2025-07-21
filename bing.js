// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.183
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["人民城市为人民", "上海成了全国最“老”的城市", "石破茂为历史性惨败鞠躬道歉", "“三伏天”为何是一年最热的时候", "结婚证发成离婚证 民政局：已道歉", "订婚仪式成了年轻人婚前的扫雷大战", "高铁一次性座套火了 12306：暂不售卖", "“韦帕”过境广东一海滩遍地海鲜", "林俊杰的心脏：依赖药物 越来越差", "铁打的宝座 流水的河南新首富", "“军工虎”何文忠受贿2.89亿获死缓", "5岁女孩独自在家未开空调猝死？假", "白天村支书 晚上世界波", "林更新爬武当山红温了", "菲律宾火锅店射杀中国人嫌犯落网", "带患癌女儿送外卖女骑手丈夫发声", "男子强奸嫂子 出狱后刺死见义勇为者", "50岁男子爬五台山晕倒后去世", "孟加拉国一军机在学校坠毁已致19死", "小孩哥地铁弹钢琴偶遇郎朗", "汪东城称被小三：她要结婚新郎不是我", "村干部回应公厕建而不用系工作失误", "急救人员回应男子爬五台山去世", "韩女子咬断性侵者舌头 61年后重审", "2只杜宾没拴绳 警方正排查养狗人", "为交社保挂名当老板 女子负债200万", "女大学生天天吃地摊串串香患胃癌", "曝美内部质疑内塔尼亚胡已失控", "房东遇“优质租客”被骗81万元", "万亿级超级水电项目开工引爆A股", "外卖“零元购”的泡沫破了", "雅鲁藏布江水电工程对印度有何影响", "女生遭男友殴打致残 法医不予鉴定", "德国一汽车撞上男孩随后飞冲上屋顶", "当地回应考生考上北大在宗祠办仪式", "华纳音乐回应旺仔小乔演唱会争议", "石破茂：继续担任首相", "男子嫌妻子开车慢 当街打断其肋骨", "以军袭击伊朗总统画面曝光", "#台风韦帕强风暴雨现场直击#", "常州笔画仅剩最后2画", "各地政府推出的妈妈岗为何“遇冷”", "男子长出4cm“生姜”大结石", "23岁研一男生抗癌4个月后离世", "英国一演员谢幕时举起巴勒斯坦国旗", "老人扶梯摔倒 女童被撞翻后按停", "男子偷了商店53只右脚鞋又还回51只", "潍坊暴雨男子驾驶牧马人连救5车", "韩空难与飞行员错关发动机有关", "37岁男子突然头部失控不断点头", "12306回应部分高铁票1年半涨超40元"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
