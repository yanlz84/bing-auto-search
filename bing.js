// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.386
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
var default_search_words = ["习主席的这些话亮明中国态度", "美参议院通过终止特朗普关税决议", "美国为何要疯狂攻击“北京时间”", "1分钟带你看APEC", "重大利好！免税店政策“大突破”", "最高20万 多地发钱奖励结婚", "微信宣布三大新功能", "天津一小区围墙防盗刺插满烧饼馒头", "第一批出家的00后已经还俗了", "中国速度重新定义“距离”", "英国安德鲁王子被剥夺头衔", "明年中考厦门自行命题？谣言", "为什么祖国完全统一势不可挡？", "专家：男性更年期早期出现大约在40岁", "注意！是“10086”不是“l0086”", "美股收盘：三大指数集体下跌", "杭州一批废弃医院学校竟成打卡地", "美国纽约州宣布进入紧急状态", "卖粮28万遭冻结账户已全部解冻", "“神二十一飞天 钱老一定看得见”", "动物园回应1995年前出生可买老年票", "甘肃一供热民企遭住建局强行接管", "全国已有29个省份延长婚假", "和钱学森有关的20个小故事", "韩国进口辣白菜超99.9%来自中国", "“五年归国路 十年两弹成”", "新人结婚邀请高中班主任当证婚人", "有茅台经销商今年已亏三四十万元", "暴雪蓝色预警！局地有大暴雪", "“馆长”大陆行再踏藩篱", "正直播NBA：勇士vs雄鹿", "“75后”冯海燕拟升正厅", "阳光玫瑰贴上这个标签后涨价数倍", "12名医务人员在苏丹中部城市遇害", "乱象频发 血猫血狗何时能得立法保障", "钱学森：外国人能搞 中国人怎么不行", "不敢请假的职场人：为何总是心虚", "鼠鼠我啊要上天了", "村庄给老人发40万：已连续发了19年", "11月起这些新规将影响你我生活", "超长火车震撼再现！到底有多少节车厢", "“江西小炒”为何成为义乌特产", "冷风劲吹！国乒男单首轮全部出局", "“中国版英伟达”科创板IPO注册获批", "侯汉廷怒批“台独”分子", "中方对军品出口采取慎重负责态度", "美国加州奥克兰博物馆遭大规模盗窃", "火锅店回应空中座位玻璃碎裂", "新“带刀护卫”画面公布", "直击第一批“小鼠航天员”选拔", "道崽采访直言要送DRG回家"]

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
