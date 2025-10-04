// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.333
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
var default_search_words = ["习近平的家国情", "大学生当兼职野人：投喂太多吃不下", "新郎新娘还堵在高速 家里先开席了", "超级月亮邂逅中秋 赏月地图出炉", "派出所副所长国庆执行任务受伤牺牲", "曾“分家”的3个广东城市要抱团了", "女生瀑布前拍照 空中飘来一排人", "23岁网红攀岩时坠崖 直播间观众目睹", "日薪5000元 横店重金求“爹”", "济南成“挤南”了", "广州一市民家中惊现“鼠条”", "杭州逃逸豹子现身产3崽系谣言", "本世纪最晚中秋来了", "苏超淘汰赛：南京vs连云港", "AI女演员出道遭抵制", "动物园回应老虎咬水管一动不动", "鸡排哥被堵在墙边求合影：要窒息了", "谢娜：不敢相信我要主持央视中秋晚会", "中央气象台发布台风红色预警", "731毒气实验室成玩具 历史不容儿戏", "公安局副局长办案时坠江 遗体已找到", "深圳大小梅沙再现“集体下饺子”", "家长把孩子忘服务区 小孩哥淡定鼓掌", "高市早苗对华政策将如何调整", "孙颖莎4比2击败陈幸同晋级决赛", "又一处中国超级景观进入世界视野", "丈夫反对投资120万女子生气砸断餐桌", "向鹏4-3险胜雨果 晋级中国大满贯4强", "王曼昱4比1申裕斌 决赛会师孙颖莎", "45岁潘玮柏宣布再度减肥", "钱塘江现大面积“龙鳞潮”", "景区否认放“张继科落水处”牌子", "普京称赞发型不羁的建筑师", "法记者在乌遭袭身亡 马克龙发声", "男子收3.5万报酬运送市值1.46亿毒品", "加沙地带超八千名巴勒斯坦人失踪", "破10亿 国庆档电影总票房再创新高", "中国气象局升级台风应急响应", "王楚钦林诗栋男双夺冠", "市民建议的哥懂粤语英语 官方回应", "马杜罗：委内瑞拉绝不会屈服", "小泉进次郎回应选举失利：能力不足", "王楚钦4比1松岛辉空晋级四强", "王曼昱蒯曼夺得中国大满贯女双冠军", "韩媒：韩日关系亮起红灯可能性增加", "邓亚萍：王楚钦孙颖莎地位难以撼动", "陕西旬阳通报“男子婚礼当天跳河”", "巴基斯坦将选派两名航天员来华训练", "美军加油机再度集结中东释放何信号", "乌军战车躲避攻击时碾压自家士兵", "地坛公园多棵树木被明星“认养”"]

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
