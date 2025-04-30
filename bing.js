// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.18
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
var default_search_words = ["习近平访问金砖国家新开发银行", "部分中国供应商按原价向美恢复发货", "三河警徽变色引关注 公安系统排查", "五一假期文旅市场热度攀升", "86岁老人与已故儿子的女友结婚", "专家谈医生肖飞手术中离场", "蔡澜被曝病危 本人深夜回应", "国足原主帅李铁案今日二审宣判", "董袭莹带出的5大疑点待协和等解答", "神十九乘组撤离空间站", "西班牙葡萄牙罕见大停电是谁的锅", "辽宁致22死火灾饭店经营者已被控制", "国务院安委会挂牌督办辽宁22死火灾", "男子深夜潜入他人院内射杀3只猫", "曝董袭莹不符合“协和4+4”要求", "女子上班前中彩票945万 工作完才领", "美参议院确认戴维·珀杜任驻华大使", "山西网红“汽车炫锅场”事故致1死", "马代遭性侵女子称酒店想用10万私了", "协和校长寄语提及董袭莹内容被删", "保安驱赶外卖员突然倒地被指假摔", "曾黎团队傲慢公关丢了人心", "家长查孩子成绩一年被收300元", "真我GT7确定登陆印度市场", "抗癌博主等到女儿放学回家才离世", "曾黎：我不是中戏两百年美女", "东北铁锅炖拿捏五一", "天一热手上长的透明水泡是什么", "沃尔玛称关税成本由美国客户承担", "女子为儿子探险开路被困悬崖", "二级保护动物丘鹬过马路一步三摇", "外交部《不跪》视频传递何种信息", "永辉超市回应标价7.96元实收8元", "沙特王储曾称中国崩了全世界都要崩", "“手机中的战斗机”站在退市边缘", "韩检方对尹锡悦私宅进行扣押搜查", "33岁抗癌博主小杨哥离世", "知名律师分析李铁案：维持原判概率大", "山姆分拣员半年瘦46斤", "大学生兼职坠入“无主化粪池”溺亡", "女儿女婿闹离婚 岳母提前立遗嘱", "汪峰和女友森林北合办公司", "程序员坚持跳绳2年跳走了脂肪肝", "辽宁一饭店发生火灾致22死3伤", "魔术vs凯尔特人", "湖南一麻辣烫店因帅气店员走红", "移动客户被私改成48元套餐长达数年", "俄国防部发布朝鲜军人作战画面", "章子怡因在领奖后台摔倒坐轮椅出行", "刘德华：和倪妮合作有找到爱情的感觉", "男子不玩自费项目被旅行社扔山里"]

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
