// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.231
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
var default_search_words = ["加快推进人与自然和谐共生的现代化", "社保断缴1次 这些待遇全部取消", "为什么孩子越来越难睡一个好觉", "个人消费贷款贴息 怎么补？补多少？", "中纪委：公职人员禁止干6类副业", "杭州著名主持人谷勇华因病去世", "净网：直播带货变带祸？红线碰不得", "管静遇难 去年曾登顶珠峰并倒立", "靠《两只蝴蝶》赚2亿？创作者：就5千", "被冲走的北京怀柔村支书遗体已找到", "社保新规将带来8700亿保费", "女贪官挖出327枚比特币？纪委回应", "女童调座椅压死弟弟 父母向车企索赔", "死刑！湘潭大学投毒案二审维持原判", "84岁老人和保姆结婚 4个子女全不知", "12306回应男生带白酒被拦当场喝完", "原北京军区司令员李新良逝世", "夏天警惕泳池“毒王”", "#严惩山东杀害前妻凶手#", "AI特效太疯狂了 秦始皇强吻北极熊", "陪看男篮亚洲杯：中国vs韩国", "54岁女子腰椎手术后怀孕产女", "具体时间定了 俄方通报特普会细节", "新增K字签证发给外国青年科技人才", "社保新规下 炒菜机器人或成最优解", "2025世界人形机器人运动会开幕式", "王毅将访问印度？外交部回应", "租房不备案罚10万？房东们别被误导了", "72岁老中医称患者女鬼附身对其猥亵", "贵州女游客被猴子踢倒骨折", "女子被赌徒前夫当儿子面杀害", "21岁电竞选手凌晨发遗书 俱乐部回应", "演员叶童在人民日报撰文", "见普京前特朗普公开发出威胁", "女子在日本被撞身亡谁应承担责任", "10分以下考生拟任教初中 当地回应", "只有三成打工人交齐五险一金", "格陵兰岛300万年冰川轰然倒塌", "特朗普气急败坏：谁说普京赢了", "实探少林寺：武僧表演1天6场挤满游客", "高校拟将公厕改造宿舍被吐槽", "顾客误将日料套餐当自助消费4千多", "#离婚女性的人身安全如何保障#", "求婚王珞丹男子被曝曾骚扰迪丽热巴", "老人给外人10万照顾老伴儿子急了", "英国一航班因婴儿哭闹引发斗殴", "#男童走失遇难办夏令营门槛有多低#", "美俄元首明天会谈 谈崩有何后果", "没有结婚证能不能领育儿补贴", "公司未给员工缴社保被判赔偿18万", "少年被干冰炸伤手指伤口深可见骨"]

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
