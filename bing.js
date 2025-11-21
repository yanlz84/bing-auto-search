// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.428
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
var default_search_words = ["十五五规划建议提到哪16个强国目标", "日本反对日本 高市被嘘下台", "国安机关披露某公司拍摄大量敏感信息", "全运赛场 “新”潮澎湃", "俄罗斯痛批高市早苗：厚颜无耻", "伊朗外长：开罗协议正式终止", "首个、首次、首台！大国重器再传好消息", "美股大跌 英伟达跌超3%", "德国医疗展盒饭致200名中国人中毒", "伊朗伊斯兰革命卫队：冲突会随时爆发", "高市错误言论陷四面楚歌", "新疆喀什地震致房屋倒塌系谣言", "泽连斯基已收到美和平计划草案", "无人军团出击 抢滩登陆演练现场披露", "当心甜食正在悄悄损害你的视力", "俄方：始终坚持台湾问题是中国内政", "许昕：对不起家庭和同事", "手机被远程操控怎么办", "郑丽文：台海无事 日本才能无事", "75岁老人全网求认干女儿：给一套房", "罗晋父亲去世", "全国每5人就有1人念过大学", "中国公民沦为“矿奴” 使馆紧急提醒", "警方回应“男子遭陌生女子强吻”", "中国代表：武力解决不了伊朗核问题", "樊振东这一球让邓亚萍感叹太强了", "樊振东3比1胜王楚钦", "亚洲飞人谢幕！回顾苏炳添封神之路", "小米汽车长沙一门店中央空调现明火", "俄军方称已控制乌克兰库皮扬斯克市", "南宁动物园：网红黑猩猩正在戒烟", "苏炳添举起战靴示意“挂靴”", "乌克兰全国启动紧急停电措施", "脑控无人车真的来了", "“冷美人”赛后头发硬如石头", "美坠毁货机关键部件现金属疲劳迹象", "马龙实现全运会大满贯", "视觉中国被判侵权向摄影师道歉", "云冈石窟大佛冻得流鼻涕？真相来了", "京津冀三地自贸试验区签署行动方案", "特斯拉回应起诉无忧传媒", "超54万张飞往日本机票被取消", "乒乓球男团北京夺冠", "成都女子家门口被害案延期审理", "外交部为何让日方自重", "黑龙江省原副省长毕宝文被查", "不只有输赢 全运会这些瞬间直抵人心", "中国稀土研究有新突破", "马龙终于有了全运会男团金牌", "马龙许昕赛后拥抱", "戚嘉林：台湾和日本没有关系"]

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
