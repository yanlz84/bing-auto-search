// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.407
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
var default_search_words = ["“体育强则中国强”", "18岁张展硕力压潘展乐孙杨夺冠", "台退将建议：福建舰的母港选址台湾", "全运会开幕式上的鳌鱼是什么鱼", "小学没毕业 初二重点课程学完了", "新人结婚当天在婚车上睡着了", "净网：3人为吸粉引流直播谩骂被拘", "女子寻亲：深圳多套房已为家人备好", "女儿养了仨月 出院记录显示“男婴”", "男子去世后曝出17万债务 妻子拒还", "交16万给孩子报培训班一门都没过", "芜湖发生特大爆炸火灾系谣言", "导演王晶曝舒淇息影内幕", "曾高考16次 36岁唐尚珺开始直播带货", "羊驼送洗后因毛发未吹干致失温死亡", "捐款140元给国家造航母 当事人发声", "农民歌手李根去世 年仅43岁", "台风“凤凰”逼近 大雪大暴雨来了", "洪秀柱：祖国完全统一才是台湾的前途", "年代剧的墙为什么都是上白下绿", "12月中下旬全国或出现流感疫情高峰", "金价再次直线上涨", "学生囤备胎导师放鸽子 保研双向辜负", "6座面包车下来7个人 拉开门还有8个", "“荒野求生”何以爆火", "男子因手机外放音量太大被舍友砍伤", "中方回应高市早苗涉台错误言论", "殡仪馆拟搬迁小区学校旁引居民担忧", "刘嘉玲喊话网店欺骗消费者", "诸暨网红“麻糍奶奶”遇车祸去世", "油价要涨了 加满1箱油将多花5元", "谷神星一号（遥十九）火箭发射失利", "F4变F3？朱孝天成立新公司疑回应", "苏菲回应卫生巾上有活虫", "男子从北京跑到上海 全程跑坏5双鞋", "126斤小学生尿酸飙到440 医生提醒", "台风“凤凰”致菲律宾83万人受灾", "“活力大湾鸡”凭高难度动作爆红", "特朗普现身NFL球赛遭观众狂嘘", "女子坐高铁遗落价值百万金条", "“台独”沈伯洋慌了：我这情况怎么办", "唯一非运动员火炬手为何是他", "受贿509万余元 蔡光辉当庭认罪悔罪", "地表最难乒乓球赛 全国冠军为何难拿", "台名嘴：想打赢解放军？永远不可能", "不得要求教师承担上街执勤等任务", "注意防范！全国整体进入流感流行季", "今晚抬头看有“笑脸”", "老人猥亵7岁女童 一审获刑两年", "中年人最无声的“炫富”：身体健康", "印度火车保洁员直接将垃圾扔下车"]

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
