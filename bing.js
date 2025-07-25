// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.191
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
var default_search_words = ["习近平接受外国驻华大使递交国书", "爸爸烟不离手10岁儿子查出肺癌", "最新放假通知：连休8天", "“赛博养老搭子”也太全能了", "全球最大蚊子工厂在巴西建成", "落水24岁女外卖员遗体已被找到", "中国黄金集团官网已变黑白", "国务院部署逐步推行免费学前教育", "上海独居老人离世 众人攻坚垃圾山", "张碧晨方称享有《年轮》永久演唱权", "佛山基孔肯雅热累计确诊超4000例", "呼和浩特公交因降雨全线停运？假", "厦大吧友称至少17人被误录马来分校", "女子低血糖晕倒姿势怪异吓坏旁人", "6名学生溺亡 教授讲坠入后致命点", "金饰价格跌破1000元/克", "新增8千多家企业 预制菜的春天来了", "柬埔寨士兵赤裸上身发射火箭弹", "中方回应法国将正式承认巴勒斯坦国", "张碧晨将不再演唱《年轮》", "揭秘恋爱脑女星的血泪婚姻", "双胞胎666分神同步考入西安交大", "女演员高海宁回应患精神疾病", "饿了么前高管受贿细节曝光", "中方回应“美称TikTok不卖就关停”", "泰柬边境冲突现场：双方互向发射炮弹", "美国航母又又又延期了", "不建议5岁孩子这么玩 伤大人自尊", "新能源车起火 一家三口及时撤离", "樊振东乒超9连胜", "#河北强降雨引发内涝现场直击#", "一年半内家里4人确诊癌症", "男子潜水被困水下溶洞5天奇迹生还", "最热三伏天 年轻人花钱养生“续命”", "泰国改口不拒绝第三方调解", "麻六记酸辣粉在开市客下架", "河南考生能上名校却去上了民办高校", "过户手机号要证明奶奶是爸爸的妈妈", "首款可折叠iPhone屏幕尺寸曝光", "媒体评政府欠万元餐费5年未结清", "泽连斯基：美国将从乌克兰购买无人机", "考生回应674上民办高校被骂脑子进水", "柬埔寨公主发布中文歌曲", "30分7秒按45分收费 向上取整成惯例", "调拨中央救灾物资支援河北陕西", "意大利一飞机头朝下坠毁在高速公路", "泰柬边境冲突扩大超13万人撤离", "东北大学官网已变黑白", "砂锅店30克毛肚仅24.1克 店方回应", "女子被打骨折涉事面试官被刑拘", "陕西吴起县城遭洪水侵袭"]

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
