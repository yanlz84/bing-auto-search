// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.164
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
var default_search_words = ["习近平给田华等8位电影艺术家回信", "270余人遇难 印空难驾驶舱对话公开", "电诈园区墙上满是救救我想回家", "外国游客扎堆扫货“中国造”", "爆冷！王楚钦、梁靖崑男双无缘决赛", "李子柒没看见吴京 张译拉着她让位", "张彬彬私生非法翻墙侵入其酒店房间", "母亲给高三女儿买聪明药致其成瘾", "百万粉网红考上复旦研究生 本人回应", "王楚钦男双出局 扇自己巴掌", "国产高铁CR450“过于先进不便展示”", "公厕标识听雨轩观瀑亭？管理方回应", "男子刚走过几秒后冰箱突然爆炸", "杨少华因高温剪彩去世？助理回应", "陈熠4比3早田希娜", "国乒提前包揽女双冠亚军", "房价倒数第一城都要建机场了", "昆明一电梯冲顶致业主身亡：维保造假", "欧洲热死人了 但还是开不起空调", "美军B-52H轰炸机现身朝鲜半岛", "王晶曝张国荣自杀原因", "孙颖莎王曼昱晋级女双决赛", "王毅就“南海仲裁案”阐明中方立场", "印度空难初步调查聚焦飞行员操作", "青甘大环线三车12胎被扎 嫌犯被抓", "又一小火锅火出圈：主打海鲜 5元/盘", "击败孙颖莎的陈熠才第2次打大满贯", "王俊凯亮相电竞世界杯开幕式", "林诗栋4比1田中佑太", "申遗成功！西夏陵被列入世界遗产名录", "多地明确痛经可带薪休假 网友吵翻", "云南山区一防护网成功拦截坠落巨石", "杨少华去世原因是肺衰竭", "业主拒缴停车费致小区堵车9小时", "美国国务院开始大规模裁员", "国足对阵日本队变五后卫会怎样", "王艺迪蒯曼晋级女双决赛", "美制裁联合国巴勒斯坦问题人权专家", "游客在景区遭红衣女子拉拽拍照", "电梯冲顶致业主身亡 15人被追责", "朱雨玲晋级美国大满贯四强", "关税不应成为霸凌他国的工具", "利物浦永久退役若塔20号球衣", "印度网球女将遭父亲枪杀", "泽连斯基：美欧对乌军援渠道全面恢复", "女儿串通中介骗走父母千万房产抵押", "辛纳战胜德约科维奇挺进温网决赛", "1961年以来最高 厦门市区降水破纪录", "品牌方回应办公室冰箱突然爆炸", "牛弹琴：越南被美国暗算了", "以色列催促美国对胡塞武装发动空袭"]

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
