// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.41
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
var default_search_words = ["习近平两次外访释中国合作之道", "中央巡视组进驻 “内鬼”潘军被查", "两次关税战没压垮这条鱼", "新“太空出差三人组”vlog上新", "靠岸中国货船数归零 美官员惊到了", "央视主持人朱迅2小时14分跑完半马", "高校回应花75万买299元路由器", "从70元卖到3000元 撕拉片为何火了", "10元手冲咖啡阿姨爆火一年后现状", "“妈妈岗”被众多母亲盯上了", "四姑娘山一游客疑因高反离世", "福建8岁失踪男孩脚印被发现？假", "刘恺威父亲一听到杨幂秒变脸", "卡皮巴拉出逃40天 动物园发悬赏公告", "宣布停火后 克什米尔再传爆炸声", "印巴突然停火背后有五大原因", "外交部罕见周末开会 这样谈关税", "“60岁冒死生双胞胎”失独母亲现状", "动物园回应悬赏通缉越狱卡皮巴拉", "美媒：美对华脱钩代价将比预期更糟", "东航MU5828安全出口被乘客打开", "中国空间站各项实验项目按计划推进", "印巴互相指责违反停火协议", "为了和中方会谈 白宫演了四场戏", "今年高价水果为啥纷纷降价", "刘强东穿猪猪侠衣服在日本被偶遇", "五羊杯曹岩磊大逆转夺冠", "陈梦说好成绩不是被打出来的", "张柏芝三胎儿子罕露面身高惊人", "行人相撞案反转 为何引起巨大争议", "为什么特朗普第一个宣布印巴停火", "斯里兰卡一巴士坠崖致15死", "台媒体人感叹：台湾真的该回家了", "林志玲怀念大S", "婚宴起火 新郎母亲说酒店还想要饭钱", "巴基斯坦总理：这是整个国家的胜利", "#妈妈是我的大女主#", "高盛：用黄金对冲2025年衰退风险", "女子半夜听到摄像头传出口哨声", "黄圣依说人生方向盘已握在自己手中", "杨子晒22岁大女儿毕业照", "聋哑司机偷拍大量女乘客 配低俗文字", "鲜花靠进口 美专家建议母亲节送纸花", "她首先是她自己才是妈妈", "75万采购路由器中标方参保人数为0", "孕妇被狗咬 主人称狗咬的让狗道歉", "武汉坐地铁公交可以抵扣房贷", "苹果商店恢复上架国家反诈中心APP", "没完全停火？这一夜印巴各执一词", "房间开空调要全体租客投票", "汇源果汁回应唱衰言论"]

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
