// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.388
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
var default_search_words = ["从三个维度读懂“大国担当”", "最快纪录！神二十一与空间站完成对接", "日本熊灾现场有明显吃人痕迹", "神舟二十一号航天员行囊揭秘", "动物园狮子因腿短走红 被叫“柯基”", "神舟二十一号发射成功", "联合国感谢中国缴清会费", "郑丽文就两岸关系强势回应外媒", "印尼防长回应购买中国歼-10战斗机", "中国首次送小鼠进入“太空家园”", "神二十神二十一乘组太空拍下全家福", "云南一电站有人跳吊桥失踪系谣言", "女子自杀6个月后英国王子失头衔", "湘潭大学投毒案罪犯被执行死刑", "神二十一航天员堂妹激动落泪", "神舟二十一号飞船过境北京掠月而过", "中国航天又见大红屏", "网友称iPhone半夜自动拨号给陌生人", "台湾社会心态变了", "董军罕见身穿便服现身", "韩国战队T1对阵中国战队12连胜", "95后村支书把留守村变网红村", "神二十一神二十乘组激动相拥", "“比特币富婆”钱志敏认罪", "大暴雪、特大暴雪要来了", "90后小伙花7000元装修入住毛坯房", "从绕地球飞3圈到只飞2圈", "00后女生在墙上雕出万里长城", "卡戴珊质疑登月造假 NASA火速回应", "全国每9个新生儿就有1个在广东", "正直播NBA：凯尔特人vs76人", "63岁儿子与94岁父亲一起居家养老", "瞄准食品中的“狠活” 国家出手", "柬埔寨电诈头目8.2亿资产被冻结", "一箭穿月！回顾神二十一发射瞬间", "谢霆锋：在重庆当然要吃些横菜", "箭月同框！直击神二十一点火发射", "美国宣布重启核试验引多方质疑", "一觉醒来神20神21会师", "荷兰在安世半导体问题上进退两难", "科学家研发能治病的“毒液”机器人", "特朗普：尚未决定是否袭击委境内目标", "曝iPhone Air销量惨淡 周激活仅5万", "错过再等1年！全国银杏观赏地图来了", "樊振东成全运会男单4号种子", "从实验室到太空舱 张洪章的关键一跃", "转运坠床新生儿生命体征平稳", "黄仁勋与韩财阀吃饭高喊全场免单", "川美师生设计的标识随神二十一升空", "Wolf：Hope确实有点菜", "太空厨房可以烤牛排烤鸡翅了"]

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
