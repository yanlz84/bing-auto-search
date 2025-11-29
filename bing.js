// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.444
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
var default_search_words = ["中共中央政治局召开会议", "中国最长的跨市地铁要来了", "香港大埔火灾已致128人遇难", "“点几下”里的幸福感", "医生：黄桃罐头缓解甲流症状有道理", "十天内 俄罗斯三批日本", "净网：网警斩断非法引流黑手", "香港特区政府开通火灾捐款通道", "数千架空客A320飞机需紧急更换软件", "上千日本民众在高市早苗官邸外抗议", "专家解读“吸毒记录等将被封存”", "宜昌居民燃气价格即将大涨系谣言", "特朗普：将永久停止第三世界国家移民", "同居算家庭成员 分手会被分家产吗", "李家超等为火灾罹难者默哀3分钟", "美股三大指数收涨 英特尔暴涨10%", "香港连续三天下半旗志哀", "驻阿富汗大使馆提醒中方人员撤离", "香港廉政公署就大埔火灾拘捕8人", "网红小吃街摊主因酷似“四郎”走红", "香港各界快速集结 助受灾居民渡难关", "2026年1月起吸毒记录可封存", "双胞胎兄弟同天迎娶双胞胎姐妹", "火车提速了 人情味不能淡了", "昆明列车事故有遇难者刚上岗几天", "琉球主权归属这笔旧账是该算算了", "中国代表：对这样的日本必须严加管束", "12月起这些新规将影响你我生活", "泰国11头粉象大皇宫前整齐鞠躬", "日本目的地全部删除！爱达邮轮改航线", "石破茂曾因吃拉面加太多叉烧被痛骂", "乌腐败丑闻发酵 泽连斯基助手辞职", "美报告中一句话在印度引起轩然大波", "《疯狂动物城2》票房破5亿", "极端天气已致斯里兰卡69人死亡", "香港：向火灾遇难者家属发放20万港元", "中国首颗全功能空间计算芯片发布", "辽宁多人自发抬车救出被困女子", "女子生理期潜水被鲨鱼咬伤", "为什么工作越忙越累晚上越想熬夜", "中国清洁发电重要突破填补全球空白", "湖北通报：钟祥市发改局照搬照抄文件", "郭士强回应男篮主场不敌韩国", "台政客炫耀与高市办公桌合影被嘲", "中国男篮76比80不敌韩国", "巴基斯坦重申坚定奉行一个中国原则", "美团王兴：外卖价格战不可持续", "4300年前后的石峁城先民找到了", "充电宝新标准将落地 3C认证还能用吗", "特朗普马斯克共进感恩节晚餐", "U17国足8比0斯里兰卡"]

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
