// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.9
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
var default_search_words = ["习近平的航天情缘", "中国贸易摩擦进入高强度阶段", "外交部再次回应：中美未就关税谈判", "美经济学家：这项排名美国垫底", "中央巡视组进驻四川 首虎落马", "山西老板投资黄金赚翻分给员工913万", "巴防长：印巴两国或会爆发全面战争", "马丽透露自己曾被霸凌自卑30多年", "印媒公布印巴军队交火画面", "陈妍希和帅哥聚餐 长相酷似陈晓", "儿子悄悄考上北大妈妈惊成静止画面", "上海五一将冲40℃？假", "学者：一个本科文凭或支撑不了5年", "男子开小米SU7时速飙到230还拍视频", "曝插足他人婚姻女星整容失败", "不要欺负七旬老人唐国强", "谢霆锋演唱会再唱《黄种人》", "韩国残运会盒饭只有泡菜小菜引众怒", "猿辅导前员工曾目睹同事加班晕倒", "中方回应考虑免征部分美商品125%关税", "“中国赢下了这一轮”", "中国采购美国大豆猪肉数量锐减", "公园回应价值6000元名贵牡丹被盗", "第16届金扫帚奖获奖名单揭晓", "外交部回应美国总统批准海底采矿", "一季度结婚登记同比减少15.9万对", "36岁倪妮说自己变老了", "美国新泽西州爆发20年最大野火", "南京一车辆爆燃 附近车辆遭波及", "波音在华已经退无可退", "男子招手打车被2辆抢客出租车撞翻", "“特朗普原以为中国会最早服软”", "俄方证实普京会见美特使", "泰国总理佩通坦因高烧入院", "澳大利亚扑杀750只山火中幸存的考拉", "复旦回应拟录取600万粉丝网红", "谢霆锋演唱会含泪唱与王菲定情曲", "足协拟申办世预赛附加赛", "中国3月共销售彩票582.17亿元", "印度成功试射射程70公里导弹", "全红婵打乒乓球绝杀王宗源", "老板端油锅上菜为护顽童自己被烫", "唐国强回应录制综艺", "主持人张泽群否认被央视开除", "小学生家长养500只蚕1周摘6斤桑叶", "第20届中国电影华表奖主持阵容公布", "武警官兵飞跃扶梯救起摔倒老人", "两出租车为抢客把乘客撞飞 官方回应", "丁真因为缺乏表演经验而紧张", "文在寅称自己遭政治起诉", "这些办公方式竟招来了间谍"]

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
