// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.456
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
var default_search_words = ["习近平同法国总统马克龙举行会谈", "德国又给高市早苗上了一课", "中国人在太空的存粮多得超乎想象", "流感季做好十条防护措施", "商家把库存电动车上好牌当二手车卖", "县卫健委回应“奥司他韦68元一盒”", "净网：有人买卖账号“赚快钱”获刑", "巴奴新菜品“水性杨花”引争议", "居民酒瓶中砸出过冬眼镜蛇", "从一张免税单看海南自贸港建设", "知名车评人陈震被多平台禁言", "新国标电动车时速超25公里断电不实", "中国夫妻的金发碧眼女儿鉴定为亲生", "商家半年内被同一人仅退款225个快递", "巴总统致信中方：感谢援助1亿美元", "40岁后微胖才是长寿“黄金体重”", "刘强东父母现身京东食堂做饭", "这5类人请立刻停止热水泡脚", "美军将采购超过30万架自杀式无人机", "日本高官公开道歉", "空军新“三剑客”亮相", "陕西夫妇赞比亚首都遇害", "奶皮子不是奶酪也不是酸奶", "多名环卫工用高压水枪打落银杏叶", "易烊千玺因身体原因终止进组安排", "张吉惟等5人全网最忙五人组", "80岁百亿富豪去世 妻子放弃继承权", "普京抵达印度 莫迪亲自到机场迎接", "马克龙抵达成都", "自行车协会回应电动车新国标争议", "2025全球独角兽500强榜单发布", "“新国标”给外卖平台立规矩", "“中国美术学院教授”假身份被曝光", "“超级月亮”高清大图", "俄方连续3周涉日表态", "湖南发现河北籍抗战阵亡将士墓碑", "联大会议上中方说了5个“严重”", "学生们想以娘家人身份见老师未婚夫", "巴西男子健身被杠铃砸胸身亡", "首个首台首次！多领域实现科技突破", "俄罗斯四批日本", "台陆军实弹射击误落民宅 3户受波及", "澳门叶挺故居重新开放", "印度民众聚普京照片周围持盘子绕圈", "太阳脸上长雀斑：个头不小数量可观", "正直播NBA：凯尔特人vs奇才", "国家药监局通报不合规名单", "外卖新国标：骑手每周至少休息1日", "中国科学家破解植物再生密码", "美国毒品泛滥超10万人丧命", "发现即摧毁！察打一体无人机实训"]

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
