// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.8
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
var default_search_words = ["习近平的航天情缘", "董明珠“海归间谍论”错误且危险", "中方特别辟谣谈判假消息意味着什么", "全过程回顾神舟二十号发射", "千万粉丝网红彩虹夫妇宣布停播", "这些办公方式竟招来了间谍", "谢霆锋演唱会含泪唱与王菲定情曲", "猿辅导猝死程序员原计划5月2日结婚", "杨坤回应四川芬达事件", "调度中心大屏现不雅画面 官方回应", "男子称炒股11年赚6000多万", "特朗普罕见发文批评普京：快住手", "澳大利亚扑杀750只山火中幸存的考拉", "孙俪新剧上演被婆家偏爱的儿媳", "下井救人女辅警破格晋升", "落马贪官被指涉“280亿广阳岛”事件", "男子骑车撞站台身亡家属索赔40万", "曝小米要求员工日均工时不低于11.5", "基辅遭俄军大规模袭击已致9人死亡", "北京大风中倒伏树木变身园艺座椅", "事关关税 中方这两句话换了顺序", "刘涛曾是通信兵还会开赛车", "夜爬灵山被困 消防员冒8级大风营救", "中国海警登临铁线礁开展维权行动", "上海车展惊现“箱包部”", "中国这两个邻国又到战争边缘", "两个航天员乘组拍下“太空全家福”", "任达华女儿在名校跳级上课", "高考被顶替的5旬辅警错过母亲下葬", "Alphabet第一季度营收902.3亿美元", "尼克斯vs活塞", "特朗普宣布关税后支持率骤降", "奥沙利文：两年内不参加表演赛", "阿姨把房让给流浪猫居住 邻居遭殃", "中信建投：当前燃料电池车板块预期弱", "国防部劝美方不要有受迫害妄想症", "特朗普考虑对华关税分级方案", "国防部：倚美谋独逃脱不掉弃子宿命", "商务部敦促美方全面取消对华关税", "以军袭击加沙多地 至少55人死亡", "老板刷到00后员工上班直播搞副业", "文在寅究竟犯下多大的事", "神二十航天员顺利进驻中国空间站", "专家解读美舰过航台海公开炒作", "孙坚在西班牙3天被偷两次", "康方生物PD-1派安普利单抗在美获批", "布云朝克特止步马德里首轮", "调查：英消费者信心降至17个月低点", "Switch 2引爆全球疯抢 任天堂拉涨", "两年期德债收益率跌超6个基点", "波音继续卖资产"]

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
