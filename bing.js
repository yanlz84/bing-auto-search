// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.65
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
var default_search_words = ["为奋进新征程提供强大精神支撑", "哈佛近7000名留学生怎么办", "外交部回应美政府拿哈佛开刀", "外部冲击下中国经济何以这么稳", "马斯克：很多人不了解中国有多强", "罗永浩直播送黄金", "网警重拳打击侵公犯罪", "朱媛媛因病改名", "警方通报男子刺死24岁女幼师案", "曝蔡依林彭于晏已复合6年", "如何看待美媒越来越多“夸”中国", "宝马女司机拖行虐猫致死？假", "中国夫妇在澳遭多名青少年殴打", "莫迪：不让巴基斯坦得到一滴水", "曹颖自曝患胃癌  这几类人注意了", "徐志胜用嘴硬控许昕", "朱洁静春晚前放化疗25次", "五款国产旗舰手机最新销量曝光", "章泽天罕晒健身照 素颜皮肤白里透红", "孙颖莎打得韩国选手怀疑起了球拍", "武汉现人狗分餐共享火锅店", "武汉暴雨 家长划桨板接娃", "哈佛华人留学生：忽然变非法移民", "外卖盒盛60℃以上食物会释放有毒物质", "李嘉诚旗下长实一楼盘涉贪污造假", "哈佛大学现有外国学生必须转学", "日薪300的拍照兼职竟是间谍陷阱", "荷兰外相：中国希望放宽ASML出口限制", "特朗普威胁对苹果征收25%关税", "知名中医肿瘤专家杨鹏飞逝世", "林诗栋赛后回应男双出局：比较可惜", "张学友演唱会撞期高考遭多人投诉", "易烊千玺李庚希《狂野时代》有吻戏", "潘展乐获全国游泳冠军赛第七金", "小伙连吃28天鸡腿饭瘦了10多斤", "董明珠回应孟羽童能否再回格力", "国家网络身份认证App用户达600万人", "梁靖崑4-3击败林诗栋晋级男单4强", "孩子一觉醒来脸肿成“发面馒头”", "27岁女子肺结节没在意 1年后确诊肺癌", "全红婵回应退赛：脚腕旧伤复发", "29岁女子爱生闷气诱发乳腺癌", "数百人陷社保补缴骗局", "李连杰时隔14年再演武侠", "男子没病却遭男科医院手术开刀治疗", "或甲醛超标 解压捏捏博主自曝患癌", "金晨与黄轩深夜聚会", "传重庆一贪官祖坟挖出3公斤金砖", "易烊千玺舒淇戛纳红毯同框亮相", "校园餐绝非“唐僧肉”", "莫斯科连续三天遭袭 普京最新表态"]

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
