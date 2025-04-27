// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.13
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
var default_search_words = ["以和为贵", "中纪委通报三河招牌改色事件", "江苏台报道野猪冲进江苏电视台", "境外旅客购物满200元可办离境退税", "张译二封华表影帝", "朱雀玄武敕令再申请改48字新名字", "“珍珠女王”白如芳逝世 年仅55岁", "银川市长信箱“已读乱回”", "热热热热五一热热热热", "71岁成龙现身成都毛坯房盯装修", "全红婵晒跳舞视频被调侃", "登顶泰山最高可得3万奖金？假", "男子做生殖手术次日身亡 卫健委介入", "伊朗港口部分集装箱再次发生爆炸", "愿无先决条件谈判 俄乌迎来拐点？", "关晓彤亮相华表奖 造型引热议", "王一博错失华表奖影帝", "国常会决定核准核电项目", "上海一蓝猫疑遭虐待被砍断四肢", "美企没钱付关税百万元货物滞留中国", "男子买狗不满意退款遭拒 当场摔死狗", "高颜值女通缉犯出狱当主播账号已封", "《哪吒2》获华表奖特别贡献影片", "美国大豆销量一周骤降50%", "关晓彤说华表奖造型就是方便走动", "张译王一博获华表影帝提名", "老师拍段子让学生鞠躬喊总裁好", "景甜华表奖造型被吐槽", "刀郎深圳演唱会哽咽致谢", "惠英红华表奖首位中国香港影后", "张译决定暂时息影", "臭屁虫衣服上产卵致女子皮肤过敏", "戈登谈0.1秒绝杀：约基奇传得漂亮", "吴彦祖脸颊比心", "教育局回应学生举报饭菜有蛆被骂", "雷佳音眉毛好像当代李逵", "快船掘金大规模冲突", "民宿老板教你识别酒店换没换床单", "刘强东给李国庆点京东外卖", "张名扬首回合终结史密斯", "近30家银行信用卡中心关停", "成龙教章子怡山东话", "中国驻伊朗大使馆发布安全提醒", "美国电商集体涨价", "梁朝伟刘嘉玲被要求比心的反应", "梅婷秦海璐 优雅大女主走红毯", "女子做流产手术7个月后查出癌症", "王俊凯华表奖后台熟人局", "C罗TIFO将台湾移出中国地图", "俄军高级官员汽车爆炸案嫌疑人被捕", "肖战直接坐中控台看孙燕姿演唱会"]

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
