// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.28
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
var default_search_words = ["习近平和青年朋友的10个暖心瞬间", "贵州游船倾覆事故致9人死亡1人失联", "游客吐槽奶茶包装使用不雅文字", "这个五一的文旅体验不要太丰富", "景区推出“窝囊版”蹦极爆火", "樊振东恩师又挖到一个“小胖”", "网警|藏蓝青春 “键”指河山", "游船侧翻事故目击者：有人没穿救生衣", "特朗普称将永远谈论“第51个州”", "三个“爆品” 藏着中国外贸秘籍", "外交部国防部罕见接连发声", "三亚辟谣游客出海与向导失散", "贵州省委书记省长赶赴游船侧翻现场", "以色列：胡塞武装的袭击源自伊朗", "贵州游船倾覆事发时能见度只有一米", "凯恩职业生涯首冠", "世锦赛决赛：赵心童7-1马克威廉姆斯", "游船倾覆目击者：事发前大风冰雹交加", "大风暴雨沙尘暴三预警齐发", "国羽苏迪曼杯四连冠", "安东尼弧线世界波绝杀", "输液过敏离世女生曾要求皮试被拒", "胖东来投诉后 主播“柴怼怼”被封号", "景区飞天魔毯失控 多名游客被甩出", "乐园回应男子疑未系安全绳蹦极", "澳大利亚大选也现“大反转”", "探访争议中开业的浙江胖都来", "陕西一景区大量虫子往游客脖子里钻", "辽篮神射手丛明晨宣布退役", "以召开会议讨论加沙军事扩展计划", "女子在沙滩玩20分钟捡了小半兜钉子", "5月5日13时57分迎来立夏", "鹿哈老婆晒婚纱照", "金靖验证张凌赫的腹肌", "比特币向下跌破95000美元", "全红婵在观众席化身“秩序管理员”", "王兴兴：带着机器人破圈的硬核青年", "刘诗诗张云龙沈月聚餐合照", "76岁老人0图纸0铁钉打造绝美木楼", "特朗普民调创80年最差 万斯：不在乎", "胡塞武装：对以实施空中封锁", "普京：俄中关系具全球稳定战略价值", "韩庚卢靖姗官宣二胎", "捷克登山客挖到价值超247万元宝藏", "留学生沿路追随解放军齐喊中国万岁", "白百何首晒二胎儿子", "中国包揽跳水世界杯9金", "加州硬刚日本失望 特朗普还能撑多久", "孙怡染红发 称吃了三天过敏药", "易小星称女儿被主播哄骗买成人玩具", "黎巴嫩9年来首次举行地方选举"]

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
