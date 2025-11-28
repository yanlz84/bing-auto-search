// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.443
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
var default_search_words = ["弘扬志愿精神凝聚向上向善力量", "香港大埔火灾已致128人遇难", "日本屡越红线 中方“亮剑”", "流感高发 这些科学防护知识要掌握", "婆婆借100万照顾车祸儿媳5年", "香港：向火灾遇难者家属发放20万港元", "现役军人陶奇获中央军委一级表彰", "香港特区政府开通火灾捐款通道", "包装玉米是“僵尸玉米”？专家回应", "香港殉职消防员原定下个月举行婚礼", "3名中国公民在塔吉克斯坦遇袭身亡", "宜昌居民燃气价格即将大涨系谣言", "香港连续三天下半旗志哀", "中方：中国无意和任何国家搞太空竞赛", "155元一棵白菜和9毛一斤的白菜一样", "中国时隔20年再发军控白皮书", "取消日本方向航线 爱达邮轮更改计划", "新华社评话费“最低50元起充”", "俄方：保留强硬回应日本权利", "外交部：高市向“台独”发出错误信号", "中方回应中俄是否就结束俄乌冲突磋商", "外交部：所谓“旧金山和约”非法无效", "香港警方谈火灾经过", "普京亲自带货：中国电动汽车不香吗", "2026年1月起吸毒记录可封存", "香港大埔火灾灭火和搜索工作已完成", "女子生理期潜水被鲨鱼咬伤", "苹果或面临380亿美元罚款", "香港大埔火灾调查预计需要三至四周", "远火对海实弹射击画面罕见曝光", "陈春江辞去陕西省副省长职务", "雷军称所有产业都值得用AI再做一遍", "这些商业银行收费被明令禁止", "网红小吃街摊主因酷似“四郎”走红", "69元《疯狂动物城2》盲盒涨至399元", "6岁女孩流感发烧一天出现脑部损伤", "郑丽文、洪秀柱再批赖清德", "香港各界快速集结 助受灾居民渡难关", "重返G8？普京：多尴尬啊", "台政客炫耀与高市办公桌合影被嘲", "中俄战略安全磋商即将举行", "普京：欧洲没收俄罗斯资产是“盗窃”", "4300年前后的石峁城先民找到了", "网友反映问题后 省委书记暗访", "比利时：用俄冻结资产援乌是破坏和平", "俄方已收到美乌达成一致的计划细节", "华盛顿枪击案：袭击者曾为CIA工作", "澳门向香港捐助3000万港元", "Faker的读秒掐表能力太强了", "王楚钦缺席WTT多哈冠军赛", "贵州茅台：选举陈华为董事长"]

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
