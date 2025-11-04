// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.395
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
var default_search_words = ["习近平会见俄罗斯总理米舒斯京", "2026年放假安排公布", "“史上最长”春节假期来了 连休9天", "全运场馆如何“怀旧”又创新", "赵鸿刚受访时带着墨镜不停擦泪", "香港多位名人骨灰被盗 家属遭勒索", "为防白嫖式退货 卖家选用巨型吊牌", "美国前副总统切尼去世", "世界最大岛正在缓缓漂走", "谁让舞剑老人进的幼儿园", "男子拍到飞机出现在马路上", "苏超冠军市在地图上放大3倍系谣言", "男子为骗保推妻入海 已被执行死刑", "外交部回应金永南逝世：沉痛哀悼", "2026年春节腊月二十八也放假", "贵州沉船事故致8死 多人被追责", "2026中秋和国庆假期分开了", "#史上最长春节假期来了#", "2026年清明端午中秋不调休", "发明固体杨枝甘露的人是天才", "网传东莞最近离不了婚 当地回应", "济南千亩银杏林垃圾遍地 当地回应", "中国的下一个“全球爆款”会是它", "太空烧烤“滋滋冒油”馋坏全球网友", "缅北白家对中国公民犯下滔天罪行", "自制奶皮子糖葫芦万物皆可串", "#帝王蟹该不该进入学校食堂#", "饿了么骑手已更换橙黑新工服", "为什么我的IP背着我去别的省了", "合肥站保洁员认真擦座椅意外走红", "多地已有扩大免费教育范围初步探索", "印度一女警怀胎七月参加举重比赛", "福建小伙参加长沙爆辣挑战赛夺冠", "#南大食堂卖帝王蟹该支持还是反对#", "韩警方逮捕114名柬埔寨电诈团伙成员", "明年中秋国庆可“请6休17”", "直播间如何抵挡“克隆人大军”", "南海将出现巨浪到狂浪区", "日本自卫队拟明天出发应对熊患", "伊拉克总理：停止进口汽油柴油和煤油", "俄总理用中国谚语感谢中方热情接待", "深圳现搓衣板状石凳 工作人员回应", "18岁儿子起诉父亲付抚养费被驳回", "教练谈全红婵伤情：每天都疼得不得了", "曝台湾公务员离职率高缺人严重", "缅北白家造成6名中国公民死亡", "江苏一餐饮店用空调冷凝水泡发粉丝", "美财长被问和马斯克打架揪衣领没", "山姆APP已将商品头图改为实拍图", "小伙花170万买迈巴赫跑婚车", "台风“海鸥”已致菲律宾26人死亡"]

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
