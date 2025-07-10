// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.160
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
var default_search_words = ["树立远大志向 勇担时代大任", "中方向以色列提出严正交涉", "公职人员被色诱拍私密照 叛国窃密", "三预警齐发 全国多地将现暴雨天气", "超40家银行推出“养老贷”", "“出轨他人妻子还打人”干部被停职", "杨少华账号删除带货视频", "29岁女演员回应在餐厅当服务员", "公职人员被判缓刑仍领41万工资", "左氧氟沙星会让跟腱有断裂风险吗", "云南现80公斤巨无霸“菌王”", "广州巨型哆啦A梦被热炸了？不实", "特朗普再对8国加征关税 最高50%", "郭德纲发文悼念杨少华：一路走好", "再婚男给前妻儿子转300万被现任起诉", "胡塞武装称击沉一艘赴以色列船只", "李金斗：杨少华午休时安详辞世", "巴黎4-0大胜皇马晋级决赛", "尹锡悦或将“牢底坐穿”", "王晶曝成龙曾被粉丝扇耳光", "杨少华曾卖房借钱给儿子买古玩", "时隔124天 尹锡悦再度被拘押", "女子应聘被要求视频看腿 公司回应", "王艺迪3比1付玉晋级16强", "男子理发店充430万 灌肠一疗程30万", "北京大雨道路积水 行车如划船", "42岁谢婷婷怀孕9个月办迎婴派对", "莫德里奇正式结束皇马生涯", "中方回应“用激光瞄准德国飞机”", "巴黎切尔西世俱杯奖金破亿", "北京市启动防汛四级应急响应", "相声演员杨少华去世", "《以法之名》烂尾", "德约科维奇逆转晋级温网四强", "《以法之名》万海心脏病下线意难平", "《以法之名》李人骏目睹王彧被杀", "迪士尼钥匙圈被炒到一个499元", "新婚7天新娘拍蜜月照被雷劈身亡", "男子借款20万陷入“以贷养贷”", "杨少华生平回顾", "男子称在西湖景区穿汉服拍照遭驱赶", "稳定币是怎么来的", "科兴天价分红538亿 多方激战控制权", "青海1岁半幼童走失12个小时被找回", "耐克在中国比去年少赚了70亿", "因拆迁索1.4万过渡费被捕新进展", "王楚钦赢球后击掌安慰对手", "DGCX鑫慷嘉130亿骗局崩盘", "租客自杀不到1个月房子再次出租", "网友拍到全红婵在湛江钓鱼", "美国政府已恢复向乌运送部分武器"]

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
